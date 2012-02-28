;(function(Model) {
  var EventEmitter = Model.EventEmitter = function() {}

  function prepareEvent(name) {
    if (!this._events) this._events = {}
    if (!this._events[name]) this._events[name] = []
    return this._events[name]
  }

  EventEmitter.prototype.off = function(name, callback, scope) {
    var events = prepareEvent.call(this, name)

    if (callback) {
      for (var i = events.length - 1; i >= 0; i--) {
        var cb = events[i].callback
        var scp = events[i].scope

        if (cb === callback && scp === scope) {
          events.splice(i, 1)
        }
      }
    } else {
      delete this._events[name]
    }

    return this
  }

  EventEmitter.prototype.on = function(name, callback, scope) {
    prepareEvent.call(this, name).push({ callback: callback, scope: scope })
    return this
  }

  EventEmitter.prototype.emit = function(name) {
    var args = Array.prototype.slice.call(arguments, 1)
    var events = prepareEvent.call(this, name)

    for (var i = 0, length = events.length; i < length; i++) {
      var callback = events[i].callback
      var scope = events[i].scope || this
      callback.apply(scope, args)
    }

    return this
  }
})(Model);
