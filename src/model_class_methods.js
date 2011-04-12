Model.ClassMethods = {
  add: function(model) {
    var id = model.id()

    if (Model.Utils.inArray(this.collection, model) === -1 && !(id && this.find(id))) {
      this.collection.push(model)
      this.trigger("add", [model])
    }

    return this;
  },

  all: function() {
    return this.collection.slice()
  },

  // Convenience method to allow a simple method of chaining class methods.
  chain: function(collection) {
    return Model.Utils.extend({}, this, { collection: collection })
  },

  count: function() {
    return this.all().length;
  },

  detect: function(func) {
    var all = this.all(),
        model

    for (var i = 0, length = all.length; i < length; i++) {
      model = all[i]
      if (func.call(model, model, i)) return model
    }
  },

  each: function(func, context) {
    var all = this.all()

    for (var i = 0, length = all.length; i < length; i++) {
      func.call(context || all[i], all[i], i, all)
    }

    return this;
  },

  find: function(id) {
    return this.detect(function() {
      return this.id() == id;
    })
  },

  first: function() {
    return this.all()[0]
  },

  load: function(callback) {
    if (this._persistence) {
      var self = this

      this._persistence.read(function(models) {
        for (var i = 0, length = models.length; i < length; i++) {
          self.add(models[i])
        }

        if (callback) callback.call(self, models)
      })
    }

    return this
  },

  last: function() {
    var all = this.all();
    return all[all.length - 1]
  },

  map: function(func, context) {
    var all = this.all()
    var values = []

    for (var i = 0, length = all.length; i < length; i++) {
      values.push(func.call(context || all[i], all[i], i, all))
    }

    return values
  },

  persistence: function(adapter) {
    if (arguments.length == 0) {
      return this._persistence
    } else {
      var options = Array.prototype.slice.call(arguments, 1)
      options.unshift(this)
      this._persistence = adapter.apply(adapter, options)
      return this
    }
  },

  pluck: function(attribute) {
    var all = this.all()
    var plucked = []

    for (var i = 0, length = all.length; i < length; i++) {
      plucked.push(all[i].attr(attribute))
    }

    return plucked
  },

  remove: function(model) {
    var index

    for (var i = 0, length = this.collection.length; i < length; i++) {
      if (this.collection[i] === model) {
        index = i
        break
      }
    }

    if (index != undefined) {
      this.collection.splice(index, 1);
      this.trigger("remove", [model]);
      return true;
    } else {
      return false;
    }
  },

  reverse: function() {
    return this.chain(this.all().reverse())
  },

  select: function(func, context) {
    var all = this.all(),
        selected = [],
        model

    for (var i = 0, length = all.length; i < length; i++) {
      model = all[i]
      if (func.call(context || model, model, i, all)) selected.push(model)
    }

    return this.chain(selected);
  },

  sort: function(func) {
    var sorted = this.all().sort(func)
    return this.chain(sorted);
  },

  sortBy: function(attribute_or_func) {
    var is_func = jQuery.isFunction(attribute_or_func)
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
  },

  use: function(plugin) {
    var args = Array.prototype.slice.call(arguments, 1)
    args.unshift(this)
    plugin.apply(this, args)
    return this
  }
};
