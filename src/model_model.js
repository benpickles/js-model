;(function(Model) {
  Model.Model = function(attributes) {
    this.attributes = Model.Utils.extend({}, attributes)
    this.changes = {}
    this.errors = new Model.Errors(this)
    this.uid = Model.UID()
    if (Model.Utils.isFunction(this.initialize)) this.initialize()
    this.emit("initialize", this)
  }

  Model.Model.extend = function() {
    var child = Model.Utils.inherits(this)
    child.anyInstance = new Model.EventEmitter()
    child.persistence = Model.NullPersistence
    child.unique_key = "id"
    Model.Utils.extend(child, Model.ClassMethods)
    return child
  }

  function set(name, value) {
    var from = this.get(name)

    // Don't write to attributes yet, store in changes for now.
    if (this.attributes[name] === value) {
      // Clean up any stale changes.
      delete this.changes[name]
    } else {
      this.changes[name] = value
    }

    this.emit("change:" + name, this, from, value)
  }

  Model.Model.prototype = {
    destroy: function(callback) {
      var self = this

      this.constructor.persistence.destroy(this, function(success) {
        if (success) {
          self.emit("destroy", self)
        }

        if (callback) callback.apply(this, arguments)
      })

      return this
    },

    emit: function() {
      var anyInstance = this.constructor.anyInstance
      if (anyInstance) anyInstance.emit.apply(anyInstance, arguments)
      Model.EventEmitter.prototype.emit.apply(this, arguments)
    },

    get: function(name) {
      if (arguments.length) {
        // Changes take precedent over attributes.
        return (name in this.changes) ?
          this.changes[name] :
          this.attributes[name]
      } else {
        // Combined attributes/changes object.
        return Model.Utils.extend({}, this.attributes, this.changes)
      }
    },

    id: function() {
      return this.attributes[this.constructor.unique_key]
    },

    newRecord: function() {
      return this.constructor.persistence.newRecord(this)
    },

    off: Model.EventEmitter.prototype.off,
    on: Model.EventEmitter.prototype.on,

    reset: function() {
      this.errors.clear()
      this.changes = {}
      return this
    },

    save: function(callback) {
      if (this.valid()) {
        var self = this

        this.constructor.persistence.save(this, function(success) {
          if (success) {
            Model.Utils.extend(self.attributes, self.changes)
            self.reset()
            self.emit("save", self)
          }

          if (callback) callback.apply(self, arguments)
        })
      } else if (callback) {
        callback(false)
      }

      return this
    },

    set: function(name, value) {
      if (arguments.length == 2) {
        set.call(this, name, value)
      } else if (typeof name == "object") {
        // Mass-assign attributes.
        for (var key in name) {
          set.call(this, key, name[key])
        }
      }

      this.emit("change", this)

      return this
    },

    toJSON: function() {
      return this.get()
    },

    valid: function() {
      this.errors.clear()
      this.validate()
      return this.errors.size() === 0
    },

    validate: function() {
      return this
    }
  }
})(Model);
