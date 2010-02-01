Model.RestPersistence = function(resource, methods) {
  var model_resource = function() {
    this.resource = resource;
  };

  model_resource.prototype = $.extend({
    create: function(model, success, failure) {
      var wrappedSuccess = function(data) {
        // Remote data is the definitive source.
        this.update(data);

        // Now run the supplied success callback.
        if (success) success.apply(this, arguments);
      };

      return this.xhr('POST', this.create_path(model), model, wrappedSuccess, failure);
    },

    create_path: function(model) {
      return this.resource;
    },

    destroy: function(model, success, failure) {
      return this.xhr('DELETE', this.update_path(model), null, success, failure);
    },

    update: function(model, success, failure) {
      var wrappedSuccess = function(data) {
        // Remote data is the definitive source.
        this.update(data);

        // Now run the supplied success callback.
        if (success) success.apply(this, arguments);
      };

      return this.xhr('PUT', this.update_path(model), model, wrappedSuccess, failure);
    },

    update_path: function(model) {
      return [this.resource, model.id()].join('/');
    },

    xhr: function(method, url, model, success, failure) {
      return $.ajax({
        type: method,
        url: url,
        dataType: "json",
        data: model ? model.toParam() : null,
        failure: function() {
          if (failure) failure.apply(model, arguments);
        },
        success: function() {
          if (success) success.apply(model, arguments);
        }
      });
    }
  }, methods);

  return new model_resource();
};
