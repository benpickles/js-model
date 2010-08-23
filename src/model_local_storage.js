Model.LocalStorage = function(klass) {
  if (!window.localStorage) {
    return {
      create: function(model, callback) {
        callback(true)
      },

      destroy: function(model, callback) {
        callback(true)
      },

      read: function(callback) {
        callback([])
      },

      update: function(model, callback) {
        callback(true)
      }
    }
  }

  var collection_uid = [klass._name, "collection"].join("-")
  var writeIndex = function(uids) {
    Model.LocalStorage.write(collection_uid, uids)
  }
  var removeFromIndex = function(uid) {
    Model.LocalStorage.remove(collection_uid, uid)
  }
  var store = function(model) {
    Model.LocalStorage.write(model.uid, model.attr())
    Model.LocalStorage.add(collection_uid, model.uid)
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

      var uids = Model.LocalStorage.read(collection_uid) || []
      var models = []
      var attributes, model, uid

      for (var i = 0, length = uids.length; i < length; i++) {
        uid = uids[i]
        attributes = Model.LocalStorage.read(uid)
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

Model.LocalStorage.add = function(key, value) {
  var uids = Model.LocalStorage.read(key) || []

  if (jQuery.inArray(value, uids) === -1) {
    uids.push(value)
    Model.LocalStorage.write(key, uids)
  }
}
Model.LocalStorage.read = function(key) {
  var data = localStorage[key]
  return data ? JSON.parse(data) : undefined
}
Model.LocalStorage.remove = function(key, value) {
  var uids = Model.LocalStorage.read(key) || []
  var index = jQuery.inArray(value, uids)

  if (index > -1) {
    uids.splice(index, 1)
    Model.LocalStorage.write(key, uids)
  }
}
Model.LocalStorage.write = function(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}
