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

    read: function(callback) {
      var klass = this.klass

      return this.xhr("GET", this.read_path(), null, function(success, xhr, data) {
        var models = []

        for (var i = 0, length = data.length; i < length; i++) {
          models.push(new klass(data[i]))
        }

        callback(models)
      })
    },

    read_path: function() {
      return resource
    },

    update: function(model, callback) {
      return this.xhr('PUT', this.update_path(model), model, callback);
    },

    update_path: function(model) {
      return [this.path(model), model.id()].join('/');
    },

    xhr: function(method, url, model, callback) {
      var self = this;
      var data = jQuery.inArray(method, ["DELETE", "GET"]) > -1 ?
        null : this.params(model);

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
        }
      });
    },

    // Rails' preferred failed validation response code, assume the response
    // contains errors and replace current model errors with them.
    handle422: function(xhr, textStatus, model) {
      var data = Model.RestPersistence.parseResponseData(xhr);

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
      var data = Model.RestPersistence.parseResponseData(xhr)

      // Remote data is the definitive source, update model.
      if (success && model && data) model.attr(data)

      if (callback) callback.call(model, success, xhr, data)
    }
  }, methods)

  return function(klass) {
    rest_persistence.klass = klass
    return rest_persistence
  }
};

Model.RestPersistence.parseResponseData = function(xhr) {
  try {
    return /\S/.test(xhr.responseText) ?
      jQuery.parseJSON(xhr.responseText) :
      null;
  } catch(e) {
    Model.Log(e);
  }
}
