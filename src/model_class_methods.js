Model.ClassMethods = {
  find: function(id) {
    return this.collection.detect(function(model) {
      return model.id() == id
    })
  },

  load: function(callback) {
    var self = this

    this.persistence.read(function(models) {
      for (var i = 0, length = models.length; i < length; i++) {
        self.collection.add(models[i])
      }

      if (callback) callback.call(self, models)
    })

    return this
  },

  use: function(plugin) {
    var args = Array.prototype.slice.call(arguments, 1)
    args.unshift(this)
    plugin.apply(this, args)
    return this
  }
};
