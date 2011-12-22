;(function(Model) {
  var Collection = Model.Collection = function(array) {
    array = array || []

    this.models = []

    for (var i = 0, length = array.length; i < length; i++) {
      this.push(array[i])
    }
  }

  Collection.prototype = new Array
  Collection.prototype.constructor = Collection

  Collection.prototype.add = function(model) {
    if (!~this.indexOf(model)) {
      return this.push(model)
    }
  }

  Collection.prototype.chain = function(collection) {
    return new this.constructor(collection)
  }

  // Make Collection#filter chainable by returning another Collection. Assumes
  // presence of Array#filter.
  Collection.prototype.filter = function() {
    var filtered = Array.prototype.filter.apply(this, arguments)
    return this.chain(filtered)
  }

  Collection.prototype.first = function() {
    return this[0]
  }

  Collection.prototype.last = function() {
    return this[this.length - 1]
  }

  Collection.prototype.pluck = function(attribute) {
    var plucked = []

    for (var i = 0, length = this.length; i < length; i++) {
      plucked.push(this[i].attr(attribute))
    }

    return plucked
  }

  Collection.prototype.remove = function(model) {
    var index

    for (var i = 0, length = this.length; i < length; i++) {
      if (this[i] === model) {
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

  Collection.prototype.toJSON = function() {
    return this.map(function(model) {
      return model.toJSON()
    })
  }
})(Model);
