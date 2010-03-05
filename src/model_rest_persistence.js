Model.RestPersistence = function(resource, methods) {
  var model_resource = function() {
    this.resource = resource;
  };

  model_resource.prototype = $.extend({
    create: function(model, callback) {
      return this.xhr('POST', this.create_path(model), model, callback);
    },

    create_path: function(model) {
      return this.resource;
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
        params[model._name] = attributes;
      } else {
        params = null;
      }
      return params;
    },

    parseResponseData: function(xhr) {
      try {
        return jQuery.parseJSON(xhr.responseText);
      } catch(e) {
        Model.Log(e);
      };
    },

    update: function(model, callback) {
      return this.xhr('PUT', this.update_path(model), model, callback);
    },

    update_path: function(model) {
      return [this.resource, model.id()].join('/');
    },

    xhr: function(method, url, model, callback) {
      var self = this;
      var data = method == "DELETE" ? null : this.params(model);

      return $.ajax({
        type: method,
        url: url,
        dataType: "text",
        data: data,
        complete: function(xhr, textStatus) {
          self.xhrComplete(xhr, textStatus, model, callback);
        }
      });
    },

    xhrComplete: function(xhr, textStatus, model, callback) {
      var data = this.parseResponseData(xhr);
      var success = textStatus == "success";

      if (data) {
        if (success) {
          // Remote data is the definitive source, update model.
          model.attr(data);
        } else if (xhr.status == 422) {
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
  }, methods);

  return new model_resource();
};
