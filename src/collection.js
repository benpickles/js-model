;(function(Model) {
  var Collection = Model.Collection = function(array) {
    array = array || []

    this.models = []

    for (var i = 0, length = array.length; i < length; i++) {
      this.push(array[i])
    }
  }

  var methods = [
    // name      chainable?   enumerable?
    "every",       false,       true,
    "filter",      true,        true,
    "forEach",     false,       true,
    "indexOf",     false,       false,
    "lastIndexOf", false,       false,
    "map",         false,       true,
    "pop",         false,       false,
    "push",        false,       false,
    "reverse",     true,        false,
    "shift",       false,       false,
    "some",        false,       true,
    "sort",        true,        false,
    "splice",      true,        false,
    "unshift",     false,       false
  ]

  for (var i = 0; i < methods.length; i += 3) {
    (function(name, clone, enumerable) {
      Collection.prototype[name] = function(callback, context) {
        var self = this
          , models = this.models
          , value

        if (enumerable) {
          // Ensure enumerable method callbacks are passed this collection as
          // as the third argument instead of the `this.models` array.
          value = models[name](function() {
            arguments[2] = self
            return callback.apply(this, arguments)
          }, context)
        } else {
          value = models[name].apply(models, arguments)
        }

        // Ensure appropriate methods return another collection instance.
        return clone ? this.clone(value) : value
      }
    })(methods[i], methods[i + 1], methods[i + 2])
  }

  Collection.prototype.add = function(model) {
    if (!~this.indexOf(model)) {
      return this.push(model)
    }
  }

  Collection.prototype.clone = function(collection) {
    return new this.constructor(collection)
  }

  Collection.prototype.count = function() {
    return this.models.length
  }

  Collection.prototype.first = function() {
    return this.models[0]
  }

  Collection.prototype.last = function() {
    return this.models[this.count() - 1]
  }

  Collection.prototype.pluck = function(attribute) {
    var plucked = []

    for (var i = 0, length = this.models.length; i < length; i++) {
      plucked.push(this.models[i].attr(attribute))
    }

    return plucked
  }

  Collection.prototype.remove = function(model) {
    var index

    for (var i = 0, length = this.models.length; i < length; i++) {
      if (this.models[i] === model) {
        index = i
        break
      }
    }

    if (index !== undefined) {
      this.splice(index, 1)
      return model
    }
  }

  Collection.prototype.sortBy = function(attribute_or_func) {
    var is_func = Model.Utils.isFunction(attribute_or_func)
    var extract = function(model) {
      return attribute_or_func.call(model)
    }

    return this.sort(function(a, b) {
      var a_attr = is_func ? extract(a) : a.attr(attribute_or_func)
      var b_attr = is_func ? extract(b) : b.attr(attribute_or_func)

      if (a_attr < b_attr) {
        return -1
      } else if (a_attr > b_attr) {
        return 1
      } else {
        return 0
      }
    })
  }

  Collection.prototype.toArray = function() {
    return this.models.slice()
  }

  Collection.prototype.toJSON = function() {
    return this.map(function(model) {
      return model.toJSON()
    })
  }
})(Model);
