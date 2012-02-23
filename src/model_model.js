Model.Model = function() {}

Model.Model.prototype = {
  attr: function(name, value) {
    if (arguments.length === 0) {
      // Combined attributes/changes object.
      return Model.Utils.extend({}, this.attributes, this.changes);
    } else if (arguments.length === 2) {
      // Don't write to attributes yet, store in changes for now.
      if (this.attributes[name] === value) {
        // Clean up any stale changes.
        delete this.changes[name];
      } else {
        this.changes[name] = value;
      }
      return this;
    } else if (typeof name === "object") {
      // Mass-assign attributes.
      for (var key in name) {
        this.attr(key, name[key]);
      }
      return this;
    } else {
      // Changes take precedent over attributes.
      return (name in this.changes) ?
        this.changes[name] :
        this.attributes[name];
    }
  },

  destroy: function(callback) {
    var self = this

    this.constructor.persistence.destroy(this, function(success) {
      if (success) {
        self.constructor.collection.remove(self)
        self.emit("destroy")
      }

      if (callback) callback.apply(this, arguments)
    })

    return this;
  },

  emit: Model.EventEmitter.prototype.emit,

  id: function() {
    return this.attributes[this.constructor.unique_key];
  },

  newRecord: function() {
    return this.constructor.persistence.newRecord(this)
  },

  off: Model.EventEmitter.prototype.off,
  on: Model.EventEmitter.prototype.on,

  reset: function() {
    this.errors.clear();
    this.changes = {};
    return this;
  },

  save: function(callback) {
    if (this.valid()) {
      var self = this

      this.constructor.persistence.save(this, function(success) {
        if (success) {
          Model.Utils.extend(self.attributes, self.changes)
          self.reset()
          self.constructor.collection.add(self)
          self.emit("save")
        }

        if (callback) callback.apply(self, arguments)
      })
    } else if (callback) {
      callback(false);
    }

    return this;
  },

  toJSON: function() {
    return this.attr()
  },

  valid: function() {
    this.errors.clear();
    this.validate();
    return this.errors.size() === 0;
  },

  validate: function() {
    return this;
  }
};
