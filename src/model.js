var Model = function(name, func) {
  // The model constructor.
  var model = function(attributes) {
    this.attributes = jQuery.extend({}, attributes)
    this.changes = {};
    this.errors = new Model.Errors(this);
    this.uid = [name, Model.UID.generate()].join("-")
    if (jQuery.isFunction(this.initialize)) this.initialize()
  };

  // Use module functionality to extend itself onto the constructor. Meta!
  Model.Module.extend.call(model, Model.Module)

  model._name = name
  model.collection = []
  model.unique_key = "id"
  model
    .extend(Model.Callbacks)
    .extend(Model.ClassMethods)

  // Add default and custom instance methods.
  jQuery.extend(model.prototype, Model.Callbacks, Model.InstanceMethods)

  if (jQuery.isFunction(func)) func.call(model, model, model.prototype)

  return model;
};
