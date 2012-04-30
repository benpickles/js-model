;(function(Model) {
  var counter = 0

  Model.UID = function() {
    return [counter++, new Date().valueOf()].join("-")
  }
})(Model)
