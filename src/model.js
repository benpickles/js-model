var Model = function(name, methods) {
  // Constructor.
  var model = function(attributes) {
    this._name = name;
    this.attributes = attributes || {};
    this.changes = {};
    this.errors = [];
    this.trigger('initialize');
  };

  model.prototype = $.extend({
    attr: function(name, value) {
      if (arguments.length == 2) {
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
        var change = this.changes[name];
        return change == undefined ? this.attributes[name] : change;
      };
    },

    callPersistMethod: function(method, success, failure) {
      if (this.persistence) {
        var self = this;
        var wrappedSuccess = function() {
          // Run the supplied callback.
          if (success) success.apply(self, arguments);

          // Now trigger an event.
          self.trigger(method);
        };

        this.persistence[method](this, wrappedSuccess, failure);
      } else {
        // No persistence adapter is defined, just trigger the event.
        this.trigger(method);
      };
    },

    clearChanges: function() {
      this.changes = {};
      return this;
    },

    destroy: function(success, failure) {
      this.callPersistMethod("destroy", success, failure);
      return this;
    },

    id: function() {
      return this.attributes.id || null;
    },

    newRecord: function() {
      return this.id() == null;
    },

    save: function(success, failure) {
      if (!this.valid()) return false;

      // Merge any changes into attributes and clear changes.
      this.attributes = $.extend(this.attributes, this.changes);
      this.clearChanges();

      var method = this.newRecord() ? "create" : "update";
      this.callPersistMethod(method, success, failure);

      return true;
    },

    toParam: function() {
      var params = {};
      for (var attr in this.attributes) {
        var value = this.attributes[attr];
        if (attr != 'id' && value != null) {
          params[this._name + '[' + attr + ']'] = value;
        };
      };
      return params;
    },

    trigger: function(name) {
      $(document).trigger([this._name, name].join(':'), [this]);
      return this;
    },

    valid: function() {
      this.validate();
      return this.errors.length == 0;
    },

    validate: function() {
      this.errors = [];
      return this;
    }
  }, methods);

  return model;
};
