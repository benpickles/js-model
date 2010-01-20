var Model = function(name, methods) {
  // Constructor.
  var model = function(attributes) {
    this._name = name;
    this.attributes = attributes || {};
    this.changes = {};
    this.errors = [];
    $().trigger(this._name + ':initialize', [this]);
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
      } else {
        // Changes take precedent over attributes.
        var change = this.changes[name];
        return change == undefined ? this.attributes[name] : change;
      };
    },

    changed: function() {
      $().trigger(this._name + ':changed', [this]);
      return this;
    },

    clearChanges: function() {
      this.changes = {};
      return this;
    },

    destroy: function() {
      $().trigger(this._name +  ':destroy', [this]);
      return this;
    },

    id: function() {
      return this.attributes.id || null;
    },

    newRecord: function() {
      return this.id() == null;
    },

    save: function() {
      if (!this.valid()) return false;

      // Merge any changes into attributes and clear changes.
      this.attributes = $.extend(this.attributes, this.changes);
      this.clearChanges();

      $().trigger(this._name + ':save', [this]);

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

    valid: function() {
      return this.validate().errors.length == 0;
    },

    validate: function() {
      this.errors = [];
      return this;
    }
  }, methods);

  return model;
};
