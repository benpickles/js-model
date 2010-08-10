Model.LocalStorage = function(klass) {
  var collection_uid = [klass._name, "collection"].join("-")
  var readIndex = function() {
    var data = localStorage[collection_uid]
    return data ? JSON.parse(data) : []
  }
  var writeIndex = function(uids) {
    localStorage.setItem(collection_uid, JSON.stringify(uids))
  }
  var addToIndex = function(uid) {
    var uids = readIndex()

    if (uids.indexOf(uid) === -1) {
      uids.push(uid)
      writeIndex(uids)
    }
  }
  var removeFromIndex = function(uid) {
    var uids = readIndex()
    var index = uids.indexOf(uid)

    if (index > -1) {
      uids.splice(index, 1)
      writeIndex(uids)
    }
  }
  var store = function(model) {
    var uid = model.uid,
       data = JSON.stringify(model.attr())
    localStorage.setItem(uid, data)
    addToIndex(uid)
  }

  return {
    create: function(model, callback) {
      store(model)
      callback(true)
    },

    destroy: function(model, callback) {
      localStorage.removeItem(model.uid)
      removeFromIndex(model.uid)
      callback(true)
    },

    read: function(callback) {
      if (!callback) return false

      var uids = readIndex()
      var models = []
      var attributes, model, uid

      for (var i = 0, length = uids.length; i < length; i++) {
        uid = uids[i]
        attributes = JSON.parse(localStorage[uid])
        model = new klass(attributes)
        model.uid = uid
        models.push(model)
      }

      callback(models)
    },

    update: function(model, callback) {
      store(model)
      callback(true)
    }
  }
}
