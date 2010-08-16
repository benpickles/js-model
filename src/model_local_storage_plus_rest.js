Model.LocalStoragePlusRest = function() {
  var rest_args = Array.prototype.slice.call(arguments)

  return function(klass) {
    var local = Model.LocalStorage(klass)
    var rest = Model.RestPersistence.apply(
      Model.RestPersistence, rest_args)(klass)
    var create_uids_key = [klass._name, "create"].join("-")
    var destroy_ids_key = [klass._name, "destroy"].join("-")
    var update_uids_key = [klass._name, "update"].join("-")

    return {
      // Always create the localStorage model, if remote creation fails store
      // its uid for later action.
      create: function(model, callback) {
        local.create(model, jQuery.noop)

        if (Model.LocalStoragePlusRest.online()) {
          rest.create(model, callback)
        } else {
          Model.LocalStorage.add(create_uids_key, model.uid)
          callback(true)
        }
      },

      // Always destroy the localStorage model, if the model has an id assume
      // this has been assigned by the server and attempt to destroy it
      // storing the id for later action if this is not possible.
      destroy: function(model, callback) {
        local.destroy(model, jQuery.noop)

        // Cleanup stale data.
        Model.LocalStorage.remove(create_uids_key, model.uid)
        Model.LocalStorage.remove(update_uids_key, model.uid)

        if (model.id()) {
          if (Model.LocalStoragePlusRest.online()) {
            rest.destroy(model, callback)
            return
          } else {
            Model.LocalStorage.add(destroy_ids_key, model.id())
          }
        }

        callback(true)
      },

      // Combine models from both localStorage and REST. Don't worry about
      // duplicates here, Model.load() (or rather Model.add()) takes care of
      // that.
      read: function(callback) {
        var models
        local.read(function(read) { models = read })

        if (Model.LocalStoragePlusRest.online()) {
          rest.read(function(read) {
            read.unshift(models.length, 0)
            models.splice.apply(models, read)
            callback(models)
          })
        } else {
          callback(models)
        }
      },

      // This is where all the clever stuff happens.
      sync: function() {
        // TODO!
      },

      // Always create the localStorage model, if remote update fails store
      // its uid for later action.
      update: function(model, callback) {
        local.update(model, jQuery.noop)

        if (Model.LocalStoragePlusRest.online()) {
          rest.update(model, callback)
        } else {
          // Don't add it to the updated list when it hasn't yet been created.
          if (Model.LocalStorage.read(create_uids_key).indexOf(model.uid) == -1) {
            Model.LocalStorage.add(update_uids_key, model.uid)
          }
          callback(true)
        }
      }
    }
  }
}

Model.LocalStoragePlusRest._online = true
Model.LocalStoragePlusRest.online = function() {
  return this._online && navigator.onLine
}
