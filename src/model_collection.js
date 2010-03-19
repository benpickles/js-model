Model.Collection = function() {
  // Constructor.
  var model_collection = function(collection) {
    this.collection = collection || [];
    this.callbacks = {};
  };

  model_collection.prototype = {
    add: function() {
      var added = [];

      for (var i = 0; i < arguments.length; i++) {
        var model = arguments[i];
        var existing_elem = this.detect(function() {
          return this.id() != null && this.id() == model.id();
        });

        if (!existing_elem) {
          this.collection.push(model);
          added.push(model);
        }
      };

      if (added.length > 0) this.trigger("add", added);

      return this;
    },

    all: function() {
      return this.collection;
    },

    bind: function(event, callback) {
      this.callbacks[event] = this.callbacks[event] || [];
      this.callbacks[event].push(callback);
      return this;
    },

    // Convenience method to allow a simple way to chain collection methods.
    chain: function(collection) {
      return new model_collection(collection);
    },

    count: function() {
      return this.collection.length;
    },

    detect: function(func) {
      var model;
      $.each(this.all(), function(i) {
        if (func.call(this, i)) {
          model = this;
          return false;
        }
      });
      return model;
    },

    each: function(func) {
      jQuery.each(this.all(), function(i) {
        func.call(this, i);
      });
      return this;
    },

    find: function(id) {
      return this.detect(function() {
        return this.id() == id;
      });
    },

    first: function() {
      return this.all()[0] || null;
    },

    last: function() {
      var all = this.all();
      return all[all.length - 1] || null;
    },

    remove: function(id) {
      var ids = _.invoke(this.collection, 'id');
      var index = _.indexOf(ids, id);
      if (index > -1) {
        this.collection.splice(index, 1);
        this.trigger("remove");
        return true;
      } else {
        return false;
      };
    },

    select: function(func) {
      var selected = [];
      $.each(this.all(), function(i) {
        if (func.call(this, i)) selected.push(this);
      });
      return this.chain(selected);
    },

    sort: function(func) {
      var sorted = _.sortBy(this.all(), function(model, i) {
        return func.call(model, i);
      });
      return this.chain(sorted);
    },

    trigger: function(name, data) {
      var callbacks = this.callbacks[name];

      if (callbacks) {
        for (var i = 0; i < callbacks.length; i++) {
          callbacks[i].apply(this, data || []);
        };
      };

      return this;
    }
  };

  return new model_collection();
};
