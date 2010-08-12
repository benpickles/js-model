Model.RestPersistence = function(resource, methods) {
	var PARAM_NAME_MATCHER = /:([\w\d]+)/g;
	
  var model_resource = function() {
    this.resource = resource;
		this.resource_param_names = [];
    while ((param_name = PARAM_NAME_MATCHER.exec(resource)) !== null) {
      this.resource_param_names.push(param_name[1]);
    };
  };

  jQuery.extend(model_resource.prototype, {
		path: function(model) {
			var path = this.resource;
			$.each(this.resource_param_names, function(i, param) {
				path = path.replace(":" + param, model.attributes[param]);
			});
			return path;
		},

    create: function(model, callback) {
      return this.xhr('POST', this.create_path(model), model, callback);
    },

    create_path: function(model) {
      return this.path(model);
    },

    destroy: function(model, callback) {
      return this.xhr('DELETE', this.destroy_path(model), model, callback);
    },

    destroy_path: function(model) {
      return this.update_path(model);
    },

    params: function(model) {
      var params;
      if (model) {
        var attributes = model.attr();
        delete attributes.id;
        params = {};
        params[model.constructor._name.toLowerCase()] = attributes;
      } else {
        params = null;
      }
      return params;
    },

    parseResponseData: function(xhr) {
      try {
        return /\S/.test(xhr.responseText) ?
          jQuery.parseJSON(xhr.responseText) :
          null;
      } catch(e) {
        Model.Log(e);
      }
    },

    update: function(model, callback) {
      return this.xhr('PUT', this.update_path(model), model, callback);
    },

    update_path: function(model) {
      return [this.path(model), model.id()].join('/');
    },

    xhr: function(method, url, model, callback) {
      var self = this;
      var data = method === "DELETE" ? null : this.params(model);

      return jQuery.ajax({
        type: method,
        url: url,
        dataType: "json",
        data: data,
        dataFilter: function(data, type) {
          return /\S/.test(data) ? data : null;
        },
        complete: function(xhr, textStatus) {
          self.xhrComplete(xhr, textStatus, model, callback)
        },
        success: function(data, textStatus, xhr) {
          self.xhrSuccess(xhr, textStatus, model, data)
        }
      });
    },

    xhrSuccess: function(xhr, textStatus, model, data) {
      // Data doesnt get sent to the `complete` callback and so isn't
      // available to pass on the user, hack it onto the xhr object rather
      // than parsing it again later.
      xhr.js_model_data = data

      // Remote data is the definitive source, update model.
      if (textStatus === "success" && model && data) model.attr(data)
    },

    // Rails' preferred failed validation response code, assume the response
    // contains errors and replace current model errors with them.
    handle422: function(xhr, textStatus, model) {
      var data = this.parseResponseData(xhr);

      if (data) {
        model.errors.clear()

        for (var attribute in data) {
          for (var i = 0; i < data[attribute].length; i++) {
            model.errors.add(attribute, data[attribute][i])
          }
        }
      }
    },

    xhrComplete: function(xhr, textStatus, model, callback) {
      // Allow custom handlers to be defined per-HTTP status code.
      var handler = this["handle" + xhr.status]
      if (handler) handler.call(this, xhr, textStatus, model)

      var success = textStatus === "success"
      if (callback) callback.call(model, success, xhr, xhr.js_model_data)
    }
  }, methods);

  return new model_resource();
};
