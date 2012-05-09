;(function(Model) {
  Model.REST = function(klass, resource, methods) {
    klass.persistence = new Model.REST.Persistence(klass, resource, methods)
  }

  var PARAM_NAME_MATCHER = /:([\w\d]+)/g

  var persistence = Model.REST.Persistence = function(klass, resource, methods) {
    this.klass = klass
    this.resource = resource
    this.resource_param_names = []

    var param_name

    while ((param_name = PARAM_NAME_MATCHER.exec(resource)) !== null) {
      this.resource_param_names.push(param_name[1])
    }

    for (var name in methods) {
      this[name] = methods[name]
    }
  }

  Model.Utils.extend(persistence.prototype, {
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

    newRecord: function(model) {
      return !model.id()
    },

    params: function(model) {
      var params;
      if (model) {
        var attributes = model.toJSON()
        delete attributes[model.constructor.unique_key];
        params = {};
        params[model.constructor._name.toLowerCase()] = attributes;
      } else {
        params = null;
      }
      if(jQuery.ajaxSettings.data){
        params = Model.Utils.extend({}, jQuery.ajaxSettings.data, params)
      }
      return JSON.stringify(params)
    },

    path: function(model) {
      var path = this.resource
      jQuery.each(this.resource_param_names, function(i, param) {
        path = path.replace(":" + param, model.attributes[param]);
      });
      return path;
    },

    read: function(callback) {
      var klass = this.klass

      return this.xhr("GET", this.read_path(), null, function(success, xhr, data) {
        data = jQuery.makeArray(data)
        var models = []

        for (var i = 0, length = data.length; i < length; i++) {
          models.push(new klass(data[i]))
        }

        callback(models)
      })
    },

    read_path: function() {
      return this.resource
    },

    save: function(model, callback) {
      var method = this.newRecord(model) ? "create" : "update"
      return this[method](model, callback)
    },

    update: function(model, callback) {
      return this.xhr('PUT', this.update_path(model), model, callback);
    },

    update_path: function(model) {
      return [this.path(model), model.id()].join('/');
    },

    xhr: function(method, url, model, callback) {
      var self = this;
      var data = method == 'GET' ? undefined : this.params(model);

      return jQuery.ajax({
        type: method,
        url: url,
        contentType: "application/json",
        dataType: "json",
        data: data,
        dataFilter: function(data, type) {
          return /\S/.test(data) ? data : undefined;
        },
        complete: function(xhr, textStatus) {
          self.xhrComplete(xhr, textStatus, model, callback)
        }
      });
    },

    xhrComplete: function(xhr, textStatus, model, callback) {
      // Allow custom handlers to be defined per-HTTP status code.
      var handler = Model.REST["handle" + xhr.status]
      if (handler) handler.call(this, xhr, textStatus, model)

      var success = textStatus === "success"
      var data = Model.REST.parseResponseData(xhr)

      // Remote data is the definitive source, update model.
      if (success && model && data) model.set(data)

      if (callback) callback.call(model, success, xhr, data)
    }
  })

  // Rails' preferred failed validation response code, assume the response
  // contains errors and replace current model errors with them.
  Model.REST.handle422 = function(xhr, textStatus, model) {
    var data = Model.REST.parseResponseData(xhr);

    if (data) {
      model.errors.clear()

      for (var attribute in data) {
        for (var i = 0; i < data[attribute].length; i++) {
          model.errors.add(attribute, data[attribute][i])
        }
      }
    }
  };

  Model.REST.parseResponseData = function(xhr) {
    try {
      return /\S/.test(xhr.responseText) ?
        jQuery.parseJSON(xhr.responseText) :
        undefined;
    } catch(e) {
      try {
        console.log(e)
      } catch(_) {}
    }
  };
})(Model);
