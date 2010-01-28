Model.Collection = function(methods) {
  // Constructor.
  var model_collection = function() {
    this.collection = [];
  };

  // Define default and any custom methods.
  model_collection.prototype = $.extend({
    add: function(model) {
      this.collection.push(model);
      return this;
    },

    all: function() {
      return this.collection;
    },

    detect: function(func) {
      return _.detect(this.collection, func) || null;
    },

    find: function(id) {
      return this.detect(function(model) {
        return model.id() == id;
      });
    },

    first: function() {
      return this.collection[0] || null;
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
      return _.select(this.collection, func);
    }
  }, methods);

  return new model_collection();
};
