Model.RestPersistence = function(resource, methods) {
  var model_resource = function() {
    this.resource = resource;
  };

  model_resource.prototype = $.extend({
    create: function(model, callback) {
      var wrappedCallback = function(success, data, xhr) {
        // Remote data is the definitive source, merge model attributes with
        // response data.
        this.update(data);

        // Execute callback if suppied.
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

    update: function(model, callback) {
      var wrappedCallback = function(success, data, xhr) {
        // Remote data is the definitive source, merge model attributes with
        // response data.
        this.update(data);

        // Execute callback if suppied.
        if (callback) callback.apply(this, arguments);
      };

      return this.xhr('PUT', this.update_path(model), model, wrappedCallback);
    },

    update_path: function(model) {
      return [this.resource, model.id()].join('/');
    },

    xhr: function(method, url, model, callback) {
      return $.ajax({
        type: method,
        url: url,
        dataType: "json",
        data: model ? model.toParam() : null,
        failure: function(data, status, xhr) {
          if (callback) callback.call(model, false, data, xhr);
        },
        success: function(data, status, xhr) {
          if (callback) callback.call(model, true, data, xhr);
        }
      });
    }
  }, methods);

  return new model_resource();
};
