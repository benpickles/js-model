Model.ClassMethods = {
  add: function() {
    var added = [];

    for (var i = 0; i < arguments.length; i++) {
      var model = arguments[i];
      var existing_elem = this.detect(function() {
        return this.id() !== null && this.id() == model.id();
      });

      if (!existing_elem) {
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
    var model;
    jQuery.each(this.all(), function(i) {
      if (func.call(this, i)) {
        model = this;
        return false;
      }
    });
    return model || null;
  },

  each: function(func) {
    jQuery.each(this.all(), function(i) {
      func.call(this, i);
    });
    return this;
  },

  find: function(id) {
    return this.detect(function() {
      return this.id() == id;
    }) || null;
  },

  first: function() {
    return this.all()[0] || null;
  },

  last: function() {
    var all = this.all();
    return all[all.length - 1] || null;
  },

  pluck: function(attribute) {
    var all = this.all()
    var plucked = []

    for (var i = 0; i < all.length; i++) {
      plucked.push(all[i].attr(attribute))
    }

    return plucked
  },

  remove: function(id) {
    var ids = _.invoke(this.collection, 'id');
    var index = _.indexOf(ids, id);
    if (index > -1) {
      this.collection.splice(index, 1);
      this.trigger("remove");
      return true;
    } else {
      return false;
    }
  },

  select: function(func) {
    var selected = [];
    jQuery.each(this.all(), function(i) {
      if (func.call(this, i)) selected.push(this);
    });
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
  }
};
