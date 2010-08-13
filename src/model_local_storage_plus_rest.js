Model.LocalStoragePlusRest = function() {
  var rest_args = Array.prototype.slice.call(arguments)

  return function(klass) {
    var local = Model.LocalStorage(klass)
    var rest = Model.RestPersistence.apply(
      Model.RestPersistence, rest_args)(klass)

    return {
      create: function(model, callback) {
        local.create(model, jQuery.noop)
        rest.create(model, callback)
      },

      // TODO: What happens when offline?!
      destroy: function(model, callback) {
        local.destroy(model, jQuery.noop)
        rest.destroy(model, callback)
      },

      // Combine models from both localStorage and REST. Don't worry about
      // duplicates here, Model.load() (or rather Model.add()) takes care of
      // that.
      read: function(callback) {
        var models
        local.read(function(read) { models = read })
        rest.read(function(read) {
          read.unshift(models.length, 0)
          models.splice.apply(models, read)
          callback(models)
        })
      },

      // This is where all the clever stuff happens.
      sync: function() {
        // TODO!
      },

      update: function(model, callback) {
        local.update(model, jQuery.noop)
        rest.update(model, callback)
      }
    }
  }
}
