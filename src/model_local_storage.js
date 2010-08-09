Model.LocalStorage = function(klass) {
  return {
    create: function(model, callback) {
      this.store(model)
      callback(true)
    },

    destroy: function(model, callback) {
      localStorage.removeItem(model.uid)
      callback(true)
    },

    read: function(callback) {
      if (!callback) return false

      var uid = [klass._name, "collection"].join("-")
      var records = JSON.parse(localStorage[uid])
      var models = []
      var attributes, model, uid

      for (var i = 0, length = records.length; i < length; i++) {
        uid = records[i]
        attributes = JSON.parse(localStorage[uid])
        model = new klass(attributes)
        model.uid = uid
        models.push(model)
      }

      callback(models)
    },

    store: function(model) {
      var uid = model.uid,
         data = JSON.stringify(model.attr())
      localStorage.setItem(uid, data)
    },

    update: function(model, callback) {
      this.store(model)
      callback(true)
    }
  }
}
