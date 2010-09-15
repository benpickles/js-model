Model.ClassMethods = {
  add: function() {
    var added = [];
    var uids = this.uids()

    for (var i = 0; i < arguments.length; i++) {
      var model = arguments[i];

      if (jQuery.inArray(model, this.collection) === -1 &&
        !(model.id() && this.find(model.id())) &&
        jQuery.inArray(model.uid, uids) === -1)
      {
        this.collection.push(model);
        added.push(model);
      }
    }

    if (added.length > 0) this.trigger("add", added);

    return this;
  },

  all: function() {
    return this.collection;
  },

  count: function() {
    return this.collection.length;
  },

  detect: function(func) {
    var all = this.all(),
        model

    for (var i = 0, length = all.length; i < length; i++) {
      model = all[i]
      if (func.call(model, i)) return model
    }
  },

  each: function(func) {
    var all = this.all()

    for (var i = 0, length = all.length; i < length; i++) {
      func.call(all[i], i)
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
    if (this.persistence) {
      var self = this

      this.persistence.read(function(models) {
        for (var i = 0, length = models.length; i < length; i++) {
          self.add(models[i])
        }

        if (callback) callback(models)
      })
    }

    return this
  },

  last: function() {
    var all = this.all();
    return all[all.length - 1]
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
      this.trigger("remove");
      return true;
    } else {
      return false;
    }
  },

  reverse: function() {
    return this.chain(this.all().reverse())
  },

  select: function(func) {
    var all = this.all(),
        selected = [],
        model

    for (var i = 0, length = all.length; i < length; i++) {
      model = all[i]
      if (func.call(model, i)) selected.push(model)
    }

    return this.chain(selected);
  },

  sort: function(func) {
    var sorted = this.all().slice().sort(func)
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

  uids: function() {
    var all = this.all()
    var uids = []

    for (var i = 0, length = all.length; i < length; i++) {
      uids.push(all[i].uid)
    }

    return uids
  }
};
