;(function(Model) {
  var EventEmitter = Model.EventEmitter = function() {}

  function prepareEvent(name) {
    if (!this._events) this._events = {}
    if (!this._events[name]) this._events[name] = []
    return this._events[name]
  }

  EventEmitter.prototype.off = function(name, callback) {
    var callbacks = prepareEvent.call(this, name)

    if (callback) {
      for (var i = 0, length = callbacks.length; i < length; i++) {
        if (callbacks[i] === callback) {
          this._events[name].splice(i, 1)
        }
      }
    } else {
      delete this._events[name]
    }

    return this
  }

  EventEmitter.prototype.on = function(name, callback) {
    prepareEvent.call(this, name).push(callback)
    return this
  }

  EventEmitter.prototype.emit = function(name) {
    var args = Array.prototype.slice.call(arguments, 1)
    var callbacks = prepareEvent.call(this, name)

    for (var i = 0, length = callbacks.length; i < length; i++) {
      callbacks[i].apply(this, args)
    }

    return this
  }
})(Model);
