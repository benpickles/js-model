Model.LocalStoragePlusRest = function() {
  var rest_args = Array.prototype.slice.call(arguments)

  return function(klass) {
    var local = Model.LocalStorage(klass)
    var rest = Model.RestPersistence.apply(
      Model.RestPersistence, rest_args)(klass)
    var create_uids_key = [klass._name, "create"].join("-")
    var destroy_ids_key = [klass._name, "destroy"].join("-")
    var update_uids_key = [klass._name, "update"].join("-")
    var sync_id_key = [klass._name, "sync_id"].join("-")

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

      // Only read from localStorage.
      read: function(callback) {
        local.read(callback)
      },

      // This is where all the clever stuff happens.
      sync: function(callback) {
        if (Model.LocalStoragePlusRest.online()) {
          var create_uids = Model.LocalStorage.read(create_uids_key) || [],
              update_uids = Model.LocalStorage.read(update_uids_key) || []
          var created = [],
              updated = {},
            destroyed = Model.LocalStorage.read(destroy_ids_key) || []
          var sync_id = Model.LocalStorage.read(sync_id_key)

          jQuery.each(create_uids, function() {
            created.push(Model.LocalStorage.read(this))
          })
          jQuery.each(update_uids, function() {
            var attributes = Model.LocalStorage.read(this)
            var id = attributes.id
            delete attributes.id
            updated[id] = attributes
          })

          var data = {
            create: created,
            destroy: destroyed,
            update: updated,
            sync_id: sync_id
          }

          jQuery.ajax({
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify(data),
            type: "PUT",
            url: rest.read_path(),
            dataFilter: Model.RestPersistence.dataFilter,
            complete: function(xhr, textStatus) {
              if (textStatus == "success") {
                var json = Model.RestPersistence.parseResponseData(xhr)
                var model

                jQuery.each(json.create || [], function(i) {
                  model = klass.detect(function() {
                    return this.uid == create_uids[i]
                  })

                  if (model) {
                    model.merge(this)
                    local.update(model, jQuery.noop)
                  } else {
                    model = new klass(this)
                    klass.add(model)
                    local.create(model)
                  }
                })

                jQuery.each(json.update || [], function() {
                  model = klass.find(this.id)

                  if (model) {
                    model.merge(this)
                    local.update(model, jQuery.noop)
                  }
                })

                jQuery.each(json.destroy || [], function() {
                  model = klass.find(this)

                  if (model) {
                    local.destroy(model, jQuery.noop)
                    klass.remove(model)
                  }
                })

                Model.LocalStorage.write(sync_id_key, json.sync_id)

                localStorage.removeItem(create_uids_key)
                localStorage.removeItem(destroy_ids_key)
                localStorage.removeItem(update_uids_key)

                if (callback) callback()
              } else if (xhr.status == 409) {
                // Conflict!
              }
            }
          })
        } else {
          callback(false)
        }
      },

      // Always create the localStorage model, if remote update fails store
      // its uid for later action.
      update: function(model, callback) {
        local.update(model, jQuery.noop)

        if (Model.LocalStoragePlusRest.online()) {
          rest.update(model, callback)
        } else {
          var created_uids = Model.LocalStorage.read(create_uids_key)

          // Don't add it to the updated list when it hasn't yet been created.
          if (jQuery.inArray(model.uid, created_uids) == -1) {
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
