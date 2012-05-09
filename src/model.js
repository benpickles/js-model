var Model = function(name, func) {
  var model = Model.Model.extend()
  model._name = name

  // Generate a model-specific Collection subclass.
  var Collection = model.Collection = Model.Collection.extend()

  // Assign a default collection to the model and have it auto add/remove a
  // model on save/destroy.
  model.collection = new Collection()
  model.collection.listenTo(model.anyInstance)

  if (Model.Utils.isFunction(func)) {
    func.call(model, model, model.prototype, Collection.prototype)
  }

  return model;
};
