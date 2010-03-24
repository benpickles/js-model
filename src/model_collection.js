Model.Collection = function(methods) {
  methods = methods || {};

  // Constructor.
  var model_collection = function(collection) {
    this.collection = collection || [];
    this.callbacks = {};
  };

  jQuery.extend(model_collection.prototype, Model.CollectionMethods, methods, {
    // Convenience method to allow a simple method of chaining collection
    // methods.
    chain: function(collection) {
      return new model_collection(collection);
    }
  });

  return new model_collection();
};
