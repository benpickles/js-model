Model.RestPersistence = function(resource, methods) {
  var model_resource = function() {
    this.resource = resource;
  };

  model_resource.prototype = $.extend({
    create: function(model, callback) {
      var wrappedCallback = function(success, data, xhr) {
        // Remote data is the definitive source, merge response data with
        // model attributes.
        this.merge(data);

        // Execute callback if supplied.
        if (callback) callback.apply(this, arguments);
      };

      return this.xhr('POST', this.create_path(model), model, wrappedCallback);
    },

    create_path: function(model) {
      return this.resource;
    },

    destroy: function(model, callback) {
      return this.xhr('DELETE', this.destroy_path(model), null, callback);
    },

    destroy_path: function(model) {
      return this.update_path(model);
    },

    params: function(model) {
      var params;
      if (model) {
        var attributes = _.clone(model.attributes);
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
      var wrappedCallback = function(success, data, xhr) {
        // Remote data is the definitive source, merge response data with
        // model attributes.
        this.merge(data);

        // Execute callback if supplied.
        if (callback) callback.apply(this, arguments);
      };

      return this.xhr('PUT', this.update_path(model), model, wrappedCallback);
    },

    update_path: function(model) {
      return [this.resource, model.id()].join('/');
    },

    xhr: function(method, url, model, callback) {
      var self = this;

      return $.ajax({
        type: method,
        url: url,
        dataType: "text",
        data: this.params(model),
        complete: function(xhr, textStatus) {
          if (callback) {
            var success = textStatus == "success";
            var data = self.parseResponseData(xhr);
            callback.call(model, success, data, xhr);
          };
        }
      });
    }
  }, methods);

  return new model_resource();
};
