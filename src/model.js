var Model = function(name, func) {
  // The model constructor.
  var model = function(attributes) {
    this.attributes = jQuery.extend({}, attributes)
    this.changes = {};
    this.errors = new Model.Errors(this);
    this.uid = [name, Model.UID.generate()].join("-")
    if (jQuery.isFunction(this.initialize)) this.initialize()
  };

  // Apply class methods and extend with any custom class methods. Make sure
  // vitals are added last so they can't be overridden.
  jQuery.extend(model, Model.Callbacks, Model.ClassMethods, {
    _name: name,
    collection: []
  });

  // Add default and custom instance methods.
  jQuery.extend(model.prototype, Model.Callbacks, Model.InstanceMethods)

  if (jQuery.isFunction(func)) func.call(model, model, model.prototype)

  return model;
};
