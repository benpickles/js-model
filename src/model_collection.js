var ModelCollection = function() {
  this.collection = [];
};

ModelCollection.prototype = {
  add: function(model) {
    this.collection.push(model);
    return this;
  },

  all: function() {
    return this.collection;
  },

  find: function(id) {
    return _.detect(this.collection, function(model) {
      return model.id() == id;
    }) || null;
  },

  first: function() {
    return this.collection[0] || null;
  },

  remove: function(id) {
    var ids = _.pluck(this.collection, 'id');
    var index = _.indexOf(ids, id);
    if (index > -1) {
      this.collection.splice(index, 1);
      return true;
    } else {
      return false;
    };
  }
};
