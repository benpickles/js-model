var Model = function(name, func) {
  var Instance = function(attributes) {
    this.attributes = Model.Utils.extend({}, attributes)
    this.changes = {}
    this.errors = new Model.Errors(this)
    this.uid = [name, Model.UID.generate()].join("-")
  }

  Instance.prototype = new Model.Instance
  Instance.prototype.constructor = Instance

  var Klass = function(collection) {
    this.collection = collection || []
  }

  Klass.prototype = new Model.Klass
  Klass.prototype.constructor = Klass
  Klass.prototype._instance = Instance
  Klass.prototype._name = name

  var klass = new Klass()

  if (Model.Utils.isFunction(func))
    func.call(klass, Klass.prototype, Instance.prototype)

  return klass
};
