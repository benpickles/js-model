Model.Collection = function(methods) {
  // Constructor.
  var model_collection = function(collection) {
    this.collection = collection || [];
  };

  // Convenience method to allow a simple way to chain collection methods.
  var chain = function(collection) {
    return new model_collection(collection);
  };

  // Define default and any custom methods.
  model_collection.prototype = $.extend({
    add: function() {
      for (var i = 0; i < arguments.length; i++) {
        this.collection.push(arguments[i]);
      };
      return this;
    },

    all: function() {
      return this.collection;
    },

    detect: function(func) {
      return _.detect(this.collection, function(model, i) {
        return func.call(model, i);
      }) || null;
    },

    find: function(id) {
      return this.detect(function() {
        return this.id() == id;
      });
    },

    first: function() {
      return this.collection[0] || null;
    },

    last: function() {
      return this.collection[this.collection.length - 1] || null;
    },

    remove: function(id) {
      var ids = _.invoke(this.collection, 'id');
      var index = _.indexOf(ids, id);
      if (index > -1) {
        this.collection.splice(index, 1);
        return true;
      } else {
        return false;
      };
    },

    select: function(func) {
      var selected = _.select(this.collection, function(model, i) {
        return func.call(model, i);
      });
      return chain(selected);
    },

    sort: function(func) {
      var sorted = _.sortBy(this.collection, function(model, i) {
        return func.call(model, i);
      });
      return chain(sorted);
    }
  }, methods);

  return new model_collection();
};
