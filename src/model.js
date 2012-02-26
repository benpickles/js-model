var Model = function(name, func) {
  var model = Model.Model.extend()

  model._name = name
  model.collection = new Model.Collection()
  model.collection.listenTo(model.anyInstance)

  if (Model.Utils.isFunction(func)) func.call(model, model, model.prototype)

  return model;
};
