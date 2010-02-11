/*  js-model JavaScript library, version 0.6.0
 *  (c) 2010 Ben Pickles
 *
 *  Released under MIT license.
 */
var Model = function(name, methods) {
  var model = function(attributes) {
    this._name = name;
    this.attributes = attributes || {};
    this.changes = {};
    this.collection = collection;
    this.errors = [];
    this.trigger('initialize');
  };

  var collection;
  if (methods && methods.collection) {
    collection = methods.collection;
    delete methods.collection;
  } else {
    collection = Model.Collection();
  };

  model = $.extend(model, collection);

  model.prototype = $.extend({
    attr: function(name, value) {
      if (arguments.length == 2) {
        if (_.isEqual(this.attributes[name], value)) {
          delete this.changes[name];
        } else {
          this.changes[name] = value;
        };
        return this;
      } else if (typeof name == "object") {
        for (var key in name) {
          this.attr(key, name[key]);
        };
        return this;
      } else {
        return (name in this.changes) ?
          this.changes[name] :
          this.attributes[name];
      };
    },

    callPersistMethod: function(method, callback) {
      var self = this;

      var manageCollection = function() {
        if (!self.collection) return;
        if (method == "create") {
          self.collection.add(self);
        } else if (method == "destroy") {
          self.collection.remove(self.id());
        };
      };

      var wrappedCallback = function(success) {
        if (success) manageCollection();

        self.trigger(method);

        var value;

        if (callback) value = callback.apply(self, arguments);

        return value;
      };

      if (this.persistence) {
        this.persistence[method](this, wrappedCallback);
      } else {
        wrappedCallback.call(this, true);
      };
    },

    destroy: function(callback) {
      this.callPersistMethod("destroy", callback);
      return this;
    },

    id: function() {
      return this.attributes.id || null;
    },

    newRecord: function() {
      return this.id() == null;
    },

    reset: function() {
      this.changes = {};
      return this;
    },

    save: function(callback) {
      if (!this.valid()) return false;

      this.update(this.changes).reset();

      var method = this.newRecord() ? "create" : "update";
      this.callPersistMethod(method, callback);

      return true;
    },

    toParam: function() {
      var params = {};
      for (var attr in this.attributes) {
        var value = this.attributes[attr];
        if (attr != 'id' && value != null) {
          params[this._name + '[' + attr + ']'] = value;
        };
      };
      return params;
    },

    trigger: function(name) {
      $(document).trigger([name, this._name].join('.'), [this]);
      return this;
    },

    update: function(attributes) {
      $.extend(this.attributes, attributes);
      return this;
    },

    valid: function() {
      this.errors = [];
      this.validate();
      return this.errors.length == 0;
    },

    validate: function() {
      return this;
    }
  }, methods);

  return model;
};
Model.Collection = function(methods) {
  var model_collection = function(collection) {
    this.collection = collection || [];
  };

  var chain = function(collection) {
    return new model_collection(collection);
  };

  model_collection.prototype = $.extend({
    add: function() {
      for (var i = 0; i < arguments.length; i++) {
        var model = arguments[i];
        var existing_elem = this.detect(function() {
          return this.id() != null && this.id() == model.id();
        });

        if (!existing_elem) {
          this.collection.push(arguments[i]);
        }
      };
      return this;
    },

    all: function() {
      return this.collection;
    },

    detect: function(func) {
      return _.detect(this.collection, function(model, i) {
        return func.call(model, i);
      }) || null;
    },

    each: function(func) {
      $.each(this.collection, function(i) {
        func.call(this, i);
      });
      return this;
    },

    find: function(id) {
      return this.detect(function() {
        return this.id() == id;
      });
    },

    first: function() {
      return this.collection[0] || null;
    },

    last: function() {
      return this.collection[this.collection.length - 1] || null;
    },

    remove: function(id) {
      var ids = _.invoke(this.collection, 'id');
      var index = _.indexOf(ids, id);
      if (index > -1) {
        this.collection.splice(index, 1);
        return true;
      } else {
        return false;
      };
    },

    select: function(func) {
      var selected = _.select(this.collection, function(model, i) {
        return func.call(model, i);
      });
      return chain(selected);
    },

    sort: function(func) {
      var sorted = _.sortBy(this.collection, function(model, i) {
        return func.call(model, i);
      });
      return chain(sorted);
    }
  }, methods);

  return new model_collection();
};
Model.RestPersistence = function(resource, methods) {
  var model_resource = function() {
    this.resource = resource;
  };

  model_resource.prototype = $.extend({
    create: function(model, callback) {
      var wrappedCallback = function(success, data, xhr) {
        this.update(data);

        if (callback) callback.apply(this, arguments);
      };

      return this.xhr('POST', this.create_path(model), model, wrappedCallback);
    },

    create_path: function(model) {
      return this.resource;
    },

    destroy: function(model, callback) {
      return this.xhr('DELETE', this.destroy_path(model), null, callback);
    },

    destroy_path: function(model) {
      return this.update_path(model);
    },

    update: function(model, callback) {
      var wrappedCallback = function(success, data, xhr) {
        this.update(data);

        if (callback) callback.apply(this, arguments);
      };

      return this.xhr('PUT', this.update_path(model), model, wrappedCallback);
    },

    update_path: function(model) {
      return [this.resource, model.id()].join('/');
    },

    xhr: function(method, url, model, callback) {
      return $.ajax({
        type: method,
        url: url,
        dataType: "json",
        data: model ? model.toParam() : null,
        failure: function(data, status, xhr) {
          if (callback) callback.call(model, false, data, xhr);
        },
        success: function(data, status, xhr) {
          if (callback) callback.call(model, true, data, xhr);
        }
      });
    }
  }, methods);

  return new model_resource();
};
