/*  js-model JavaScript library, version 0.11.0
 *  (c) 2010-2012 Ben Pickles
 *
 *  Released under MIT license.
 */
var Model = function(name, func) {
  // The model constructor.
  var model = function(attributes) {
    this.attributes = Model.Utils.extend({}, attributes)
    this.changes = {};
    this.errors = new Model.Errors(this);
    this.uid = [name, Model.UID.generate()].join("-")
    if (Model.Utils.isFunction(this.initialize)) this.initialize()
  };

  // Use module functionality to extend itself onto the constructor. Meta!
  Model.Module.extend.call(model, Model.Module)

  model._name = name
  model.collection = []
  model.unique_key = "id"
  model
    .extend(Model.Callbacks)
    .extend(Model.ClassMethods)

  model.prototype = new Model.Base
  model.prototype.constructor = model

  if (Model.Utils.isFunction(func)) func.call(model, model, model.prototype)

  return model;
};

Model.Callbacks = {
  bind: function(event, callback) {
    this.callbacks = this.callbacks || {}
    this.callbacks[event] = this.callbacks[event] || [];
    this.callbacks[event].push(callback);
    return this;
  },

  trigger: function(name, data) {
    this.callbacks = this.callbacks || {}

    var callbacks = this.callbacks[name];

    if (callbacks) {
      for (var i = 0; i < callbacks.length; i++) {
        callbacks[i].apply(this, data || []);
      }
    }

    return this;
  },

  unbind: function(event, callback) {
    this.callbacks = this.callbacks || {}

    if (callback) {
      var callbacks = this.callbacks[event] || [];

      for (var i = 0; i < callbacks.length; i++) {
        if (callbacks[i] === callback) {
          this.callbacks[event].splice(i, 1);
        }
      }
    } else {
      delete this.callbacks[event];
    }

    return this;
  }
};

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
    return Model.Utils.extend({}, this, { collection: collection || [] })
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
  },

  use: function(plugin) {
    var args = Array.prototype.slice.call(arguments, 1)
    args.unshift(this)
    plugin.apply(this, args)
    return this
  }
};

Model.Errors = function(model) {
  this.errors = {};
  this.model = model;
};

Model.Errors.prototype = {
  add: function(attribute, message) {
    if (!this.errors[attribute]) this.errors[attribute] = [];
    this.errors[attribute].push(message);
    return this
  },

  all: function() {
    return this.errors;
  },

  clear: function() {
    this.errors = {};
    return this
  },

  each: function(func) {
    for (var attribute in this.errors) {
      for (var i = 0; i < this.errors[attribute].length; i++) {
        func.call(this, attribute, this.errors[attribute][i]);
      }
    }
    return this
  },

  on: function(attribute) {
    return this.errors[attribute] || [];
  },

  size: function() {
    var count = 0;
    this.each(function() { count++; });
    return count;
  }
};

Model.InstanceMethods = {
  asJSON: function() {
    return this.attr()
  },

  attr: function(name, value) {
    if (arguments.length === 0) {
      // Combined attributes/changes object.
      return Model.Utils.extend({}, this.attributes, this.changes);
    } else if (arguments.length === 2) {
      // Don't write to attributes yet, store in changes for now.
      if (this.attributes[name] === value) {
        // Clean up any stale changes.
        delete this.changes[name];
      } else {
        this.changes[name] = value;
      }
      this.trigger("change:" + name, [this])
      return this;
    } else if (typeof name === "object") {
      // Mass-assign attributes.
      for (var key in name) {
        this.attr(key, name[key]);
      }
      this.trigger("change", [this])
      return this;
    } else {
      // Changes take precedent over attributes.
      return (name in this.changes) ?
        this.changes[name] :
        this.attributes[name];
    }
  },

  callPersistMethod: function(method, callback) {
    var self = this;

    // Automatically manage adding and removing from the model's Collection.
    var manageCollection = function() {
      if (method === "destroy") {
        self.constructor.remove(self)
      } else {
        self.constructor.add(self)
      }
    };

    // Wrap the existing callback in this function so we always manage the
    // collection and trigger events from here rather than relying on the
    // persistence adapter to do it for us. The persistence adapter is
    // only required to execute the callback with a single argument - a
    // boolean to indicate whether the call was a success - though any
    // other arguments will also be forwarded to the original callback.
    var wrappedCallback = function(success) {
      if (success) {
        // Merge any changes into attributes and clear changes.
        self.merge(self.changes).reset();

        // Add/remove from collection if persist was successful.
        manageCollection();

        // Trigger the event before executing the callback.
        self.trigger(method);
      }

      // Store the return value of the callback.
      var value;

      // Run the supplied callback.
      if (callback) value = callback.apply(self, arguments);

      return value;
    };

    if (this.constructor._persistence) {
      this.constructor._persistence[method](this, wrappedCallback);
    } else {
      wrappedCallback.call(this, true);
    }
  },

  destroy: function(callback) {
    this.callPersistMethod("destroy", callback);
    return this;
  },

  id: function() {
    return this.attributes[this.constructor.unique_key];
  },

  merge: function(attributes) {
    Model.Utils.extend(this.attributes, attributes);
    return this;
  },

  newRecord: function() {
    return this.id() === undefined
  },

  reset: function() {
    this.errors.clear();
    this.changes = {};
    return this;
  },

  save: function(callback) {
    if (this.valid()) {
      var method = this.newRecord() ? "create" : "update";
      this.callPersistMethod(method, callback);
    } else if (callback) {
      callback(false);
    }

    return this;
  },

  valid: function() {
    this.errors.clear();
    this.validate();
    return this.errors.size() === 0;
  },

  validate: function() {
    return this;
  }
};

Model.localStorage = function(klass) {
  if (!window.localStorage) {
    return {
      create: function(model, callback) {
        callback(true)
      },

      destroy: function(model, callback) {
        callback(true)
      },

      read: function(callback) {
        callback([])
      },

      update: function(model, callback) {
        callback(true)
      }
    }
  }

  var collection_uid = [klass._name, "collection"].join("-")
  var readIndex = function() {
    var data = localStorage[collection_uid]
    return data ? JSON.parse(data) : []
  }
  var writeIndex = function(uids) {
    localStorage.setItem(collection_uid, JSON.stringify(uids))
  }
  var addToIndex = function(uid) {
    var uids = readIndex()

    if (Model.Utils.inArray(uids, uid) === -1) {
      uids.push(uid)
      writeIndex(uids)
    }
  }
  var removeFromIndex = function(uid) {
    var uids = readIndex()
    var index = Model.Utils.inArray(uids, uid)

    if (index > -1) {
      uids.splice(index, 1)
      writeIndex(uids)
    }
  }
  var store = function(model) {
    localStorage.setItem(model.uid, JSON.stringify(model.asJSON()))
    addToIndex(model.uid)
  }

  return {
    create: function(model, callback) {
      store(model)
      callback(true)
    },

    destroy: function(model, callback) {
      localStorage.removeItem(model.uid)
      removeFromIndex(model.uid)
      callback(true)
    },

    read: function(callback) {
      if (!callback) return false

      var existing_uids = klass.map(function() { return this.uid })
      var uids = readIndex()
      var models = []
      var attributes, model, uid

      for (var i = 0, length = uids.length; i < length; i++) {
        uid = uids[i]

        if (Model.Utils.inArray(existing_uids, uid) == -1) {
          attributes = JSON.parse(localStorage[uid])
          model = new klass(attributes)
          model.uid = uid
          models.push(model)
        }
      }

      callback(models)
    },

    update: function(model, callback) {
      store(model)
      callback(true)
    }
  }
};

Model.Log = function() {
  if (window.console) window.console.log.apply(window.console, arguments);
};

Model.Module = {
  extend: function(obj) {
    Model.Utils.extend(this, obj)
    return this
  },

  include: function(obj) {
    Model.Utils.extend(this.prototype, obj)
    return this
  }
};

Model.REST = function(klass, resource, methods) {
	var PARAM_NAME_MATCHER = /:([\w\d]+)/g;
  var resource_param_names = (function() {
    var resource_param_names = []
    var param_name

    while ((param_name = PARAM_NAME_MATCHER.exec(resource)) !== null) {
      resource_param_names.push(param_name[1])
    }

    return resource_param_names
  })()

  return Model.Utils.extend({
		path: function(model) {
      var path = resource;
      jQuery.each(resource_param_names, function(i, param) {
				path = path.replace(":" + param, model.attributes[param]);
			});
			return path;
		},

    create: function(model, callback) {
      return this.xhr('POST', this.create_path(model), model, callback);
    },

    create_path: function(model) {
      return this.path(model);
    },

    destroy: function(model, callback) {
      return this.xhr('DELETE', this.destroy_path(model), model, callback);
    },

    destroy_path: function(model) {
      return this.update_path(model);
    },

    params: function(model) {
      var params;
      if (model) {
        var attributes = model.asJSON()
        delete attributes[model.constructor.unique_key];
        params = {};
        params[model.constructor._name.toLowerCase()] = attributes;
      } else {
        params = null;
      }
      if(jQuery.ajaxSettings.data){
        params = Model.Utils.extend({}, jQuery.ajaxSettings.data, params)
      }
      return JSON.stringify(params)
    },

    read: function(callback) {
      return this.xhr("GET", this.read_path(), null, function(success, xhr, data) {
        data = jQuery.makeArray(data)
        var models = []

        for (var i = 0, length = data.length; i < length; i++) {
          models.push(new klass(data[i]))
        }

        callback(models)
      })
    },

    read_path: function() {
      return resource
    },

    update: function(model, callback) {
      return this.xhr('PUT', this.update_path(model), model, callback);
    },

    update_path: function(model) {
      return [this.path(model), model.id()].join('/');
    },

    xhr: function(method, url, model, callback) {
      var self = this;
      var data = method == 'GET' ? undefined : this.params(model);

      return jQuery.ajax({
        type: method,
        url: url,
        contentType: "application/json",
        dataType: "json",
        data: data,
        dataFilter: function(data, type) {
          return /\S/.test(data) ? data : undefined;
        },
        complete: function(xhr, textStatus) {
          self.xhrComplete(xhr, textStatus, model, callback)
        }
      });
    },

    xhrComplete: function(xhr, textStatus, model, callback) {
      // Allow custom handlers to be defined per-HTTP status code.
      var handler = Model.REST["handle" + xhr.status]
      if (handler) handler.call(this, xhr, textStatus, model)

      var success = textStatus === "success"
      var data = Model.REST.parseResponseData(xhr)

      // Remote data is the definitive source, update model.
      if (success && model && data) model.attr(data)

      if (callback) callback.call(model, success, xhr, data)
    }
  }, methods)
};

// TODO: Remove in v1 if it ever gets there.
Model.RestPersistence = Model.REST;

// Rails' preferred failed validation response code, assume the response
// contains errors and replace current model errors with them.
Model.REST.handle422 = function(xhr, textStatus, model) {
  var data = Model.REST.parseResponseData(xhr);

  if (data) {
    model.errors.clear()

    for (var attribute in data) {
      for (var i = 0; i < data[attribute].length; i++) {
        model.errors.add(attribute, data[attribute][i])
      }
    }
  }
};

Model.REST.parseResponseData = function(xhr) {
  try {
    return /\S/.test(xhr.responseText) ?
      jQuery.parseJSON(xhr.responseText) :
      undefined;
  } catch(e) {
    Model.Log(e);
  }
};

Model.UID = {
  counter: 0,

  generate: function() {
    return [new Date().valueOf(), this.counter++].join("-")
  },

  reset: function() {
    this.counter = 0
    return this
  }
};

Model.Utils = {
  extend: function(receiver) {
    var objs = Array.prototype.slice.call(arguments, 1)

    for (var i = 0, length = objs.length; i < length; i++) {
      for (var property in objs[i]) {
        receiver[property] = objs[i][property]
      }
    }

    return receiver
  },

  inArray: function(array, obj) {
    if (array.indexOf) return array.indexOf(obj)

    for (var i = 0, length = array.length; i < length; i++) {
      if (array[i] === obj) return i
    }

    return -1
  },

  isFunction: function(obj) {
    return Object.prototype.toString.call(obj) === "[object Function]"
  }
}

Model.VERSION = "0.11.0";

Model.Base = (function() {
  function Base() {}
  Base.prototype = Model.Utils.extend({}, Model.Callbacks, Model.InstanceMethods)
  return Base
})();
