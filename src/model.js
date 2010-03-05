var Model = function(name, methods) {
  // The model constructor.
  var model = function(attributes) {
    this._name = name;
    this.attributes = attributes || {};
    this.callbacks = {};
    this.changes = {};
    this.collection = collection;
    this.errors = new Model.Errors(this);
  };

  // Use a custom collection object if specified, otherwise create a default.
  var collection;
  if (methods && methods.collection) {
    collection = methods.collection;
    delete methods.collection;
  } else {
    collection = Model.Collection();
  };

  // Borrow the Collection's methods and add to the model as "class" methods.
  model = $.extend(model, collection);

  model.prototype = $.extend({
    attr: function(name, value) {
      if (arguments.length == 0) {
        // Combined attributes/changes object.
        return $.extend(_.clone(this.attributes), this.changes);
      } else if (arguments.length == 2) {
        // Don't write to attributes yet, store in changes for now.
        if (_.isEqual(this.attributes[name], value)) {
          // Clean up any stale changes.
          delete this.changes[name];
        } else {
          this.changes[name] = value;
        };
        return this;
      } else if (typeof name == "object") {
        // Mass-assign attributes.
        for (var key in name) {
          this.attr(key, name[key]);
        };
        return this;
      } else {
        // Changes take precedent over attributes.
        return (name in this.changes) ?
          this.changes[name] :
          this.attributes[name];
      };
    },

    bind: function(event, callback) {
      this.callbacks[event] = this.callbacks[event] || [];
      this.callbacks[event].push(callback);
      return this;
    },

    callPersistMethod: function(method, callback) {
      var self = this;

      // Automatically manage adding and removing from a Model.Collection if
      // one is defined.
      var manageCollection = function() {
        if (!self.collection) return;
        if (method == "create") {
          self.collection.add(self);
        } else if (method == "destroy") {
          self.collection.remove(self.id());
        };
      };

      // Wrap the existing callback in this function so we always manage the
      // collection and trigger events from here rather than relying on the
      // persistence adapter to do it for us. The persistence adapter is
      // only required to execute the callback with a single argument - a
      // boolean to indicate whether the call was a success - though any
      // other arguments will also be forwarded to the original callback.
      var wrappedCallback = function(success) {
        if (success) {
          // Merge any changes into attributes and clear changes.
          self.merge(self.changes).reset();

          // Add/remove from collection if persist was successful.
          manageCollection();

          // Trigger the event before executing the callback.
          self.trigger(method);
        };

        // Store the return value of the callback.
        var value;

        // Run the supplied callback.
        if (callback) value = callback.apply(self, arguments);

        return value;
      };

      if (this.persistence) {
        this.persistence[method](this, wrappedCallback);
      } else {
        wrappedCallback.call(this, true);
      };
    },

    destroy: function(callback) {
      this.callPersistMethod("destroy", callback);
      return this;
    },

    id: function() {
      return this.attributes.id || null;
    },

    merge: function(attributes) {
      $.extend(this.attributes, attributes);
      return this;
    },

    newRecord: function() {
      return this.id() == null;
    },

    reset: function() {
      this.errors.clear();
      this.changes = {};
      return this;
    },

    save: function(callback) {
      if (this.valid()) {
        var method = this.newRecord() ? "create" : "update";
        this.callPersistMethod(method, callback);
      } else {
        if (callback) callback(false);
      }

      return this;
    },

    trigger: function(name, data) {
      var callbacks = this.callbacks[name];

      if (callbacks) {
        for (var i = 0; i < callbacks.length; i++) {
          callbacks[i].apply(this, data);
        };
      };

      return this;
    },

    update: function(attributes) {
      this.merge(attributes).trigger("update");
      return this;
    },

    valid: function() {
      this.errors.clear();
      this.validate();
      return this.errors.size() == 0;
    },

    validate: function() {
      return this;
    }
  }, methods);

  return model;
};
