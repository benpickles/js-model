Model.NullPersistence = function() {
  return {
    destroy: function(model, callback) {
      callback(true)
    },

    read: function(callback) {
      callback([])
    },

    save: function(model, callback) {
      callback(true)
    }
  }
}
