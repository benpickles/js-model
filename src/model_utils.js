Model.Utils = {
  extend: function(receiver) {
    var objs = Array.prototype.slice.call(arguments, 1)

    for (var i = 0, length = objs.length; i < length; i++) {
      for (var property in objs[i]) {
        receiver[property] = objs[i][property]
      }
    }

    return receiver
  }
}
