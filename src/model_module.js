Model.Module = {
  extend: function(obj) {
    Model.Utils.extend(this, obj)
    return this
  },

  include: function(obj) {
    Model.Utils.extend(this.prototype, obj)
    return this
  }
};
