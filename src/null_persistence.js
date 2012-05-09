Model.NullPersistence = {
  destroy: function(model, callback) {
    callback(true)
  },

  newRecord: function(model) {
    return false
  },

  read: function(callback) {
    callback([])
  },

  save: function(model, callback) {
    callback(true)
  }
}
