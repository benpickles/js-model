Model.RestPersistence = function(resource, methods) {
  var model_resource = function() {
    this.resource = resource;
  };

  model_resource.prototype = $.extend({
    create: function(model, success, failure) {
      var self = this;
      var wrappedSuccess = function(model, xhr) {
        // Set model's id from the returned location header.
        model.attributes.id =
          self.idFromLocation(xhr.getResponseHeader('Location'));

        // Now run the supplied success callback.
        if (success) success(model, xhr);
      };

      return this.xhr('POST', this.create_path(model), model, wrappedSuccess, failure);
    },

    create_path: function(model) {
      return this.resource;
    },

    destroy: function(model, success, failure) {
      return this.xhr('DELETE', this.update_path(model), null, success, failure);
    },

    idFromLocation: function(location) {
      var id = location.match(/\/(\d+)$/)[1];
      return id ? parseInt(id) : null;
    },

    update: function(model, success, failure) {
      return this.xhr('PUT', this.update_path(model), model, success, failure);
    },

    update_path: function(model) {
      return [this.resource, model.id()].join('/');
    },

    xhr: function(method, url, model, success, failure) {
      return $.ajax({
        type: method,
        url: url,
        data: model ? model.toParam() : null,
        complete: function(xhr, status) {
          if (success && status == "success") {
            success(model, xhr);
          } else if (failure) {
            failure(model, xhr);
          };
        }
      });
    }
  }, methods);

  return new model_resource();
};
