Model.RestPersistence = function(resource, methods) {
	var PARAM_NAME_MATCHER = /:([\w\d]+)/g;
  var resource_param_names = (function() {
    var resource_param_names = []
    var param_name

    while ((param_name = PARAM_NAME_MATCHER.exec(resource)) !== null) {
      resource_param_names.push(param_name[1])
    }

    return resource_param_names
  })()

  var rest_persistence = jQuery.extend({
		path: function(model) {
      var path = resource;
      $.each(resource_param_names, function(i, param) {
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
        complete: function(xhr, textStatus) {
          self.xhrComplete(xhr, textStatus, model, callback);
        }
      });
    },

    xhrComplete: function(xhr, textStatus, model, callback) {
      var data = this.parseResponseData(xhr);
      var success = textStatus === "success";

      if (data) {
        if (success) {
          // Remote data is the definitive source, update model.
          model.attr(data);
        } else if (xhr.status === 422) {
          // Rails' preferred failed validation response code, assume these
          // are errors and replace current model errors with them.
          model.errors.clear();

          for (var attribute in data) {
            for (var i = 0; i < data[attribute].length; i++) {
              model.errors.add(attribute, data[attribute][i]);
            }
          }
        }
      }

      if (callback) callback.call(model, success, xhr);
    }
  }, methods)

  return function() {
    return rest_persistence
  }
};
