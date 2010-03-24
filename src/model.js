var Model = function(name, class_methods, instance_methods) {
  class_methods = class_methods || {};
  instance_methods = instance_methods || {};

  // The model constructor.
  var model = function(attributes) {
    this.attributes = attributes || {};
    this.callbacks = {};
    this.changes = {};
    this.errors = new Model.Errors(this);
  };

  // Always apply Model.Collection methods as model class methods and extend
  // with any custom class methods. Make sure _name is added last.
  jQuery.extend(model, Model.Collection(class_methods), { _name: name });

  // Add default and custom instance methods.
  jQuery.extend(model.prototype, Model.InstanceMethods, instance_methods);

  return model;
};
