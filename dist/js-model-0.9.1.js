/*  js-model JavaScript library, version 0.9.1
 *  (c) 2010 Ben Pickles
 *
 *  Released under MIT license.
 */
var Model = function(name, class_methods, instance_methods) {
  class_methods = class_methods || {};
  instance_methods = instance_methods || {};

  // The model constructor.
  var model = function(attributes) {
    this.attributes = attributes || {};
    this.changes = {};
    this.errors = new Model.Errors(this);
    this.uid = [name, Model.UID.generate()].join("-")
  };

  // Persistence is special, remove it from class_methods.
  var persistence = class_methods.persistence
  delete class_methods.persistence

  // Apply class methods and extend with any custom class methods. Make sure
  // vitals are added last so they can't be overridden.
  jQuery.extend(model, Model.Callbacks, Model.ClassMethods, class_methods, {
    _name: name,
    collection: [],

    // Convenience method to allow a simple method of chaining class methods.
    chain: function(collection) {
      return jQuery.extend({}, this, { collection: collection });
    }
  });

  // Initialise persistence with a reference to the class.
  if (persistence) model.persistence = persistence(model)

  // Add default and custom instance methods.
  jQuery.extend(model.prototype, Model.Callbacks, Model.InstanceMethods,
    instance_methods);

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
  attr: function(name, value) {
    if (arguments.length === 0) {
      // Combined attributes/changes object.
      return jQuery.extend({}, this.attributes, this.changes);
    } else if (arguments.length === 2) {
      // Don't write to attributes yet, store in changes for now.
      if (this.attributes[name] === value) {
        // Clean up any stale changes.
        delete this.changes[name];
      } else {
        this.changes[name] = value;
      }
      return this;
    } else if (typeof name === "object") {
      // Mass-assign attributes.
      for (var key in name) {
        this.attr(key, name[key]);
      }
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
      if (method === "create") {
        self.constructor.add(self);
      } else if (method === "destroy") {
        self.constructor.remove(self)
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

    if (this.constructor.persistence) {
      this.constructor.persistence[method](this, wrappedCallback);
    } else {
      wrappedCallback.call(this, true);
    }
  },

  destroy: function(callback) {
    this.callPersistMethod("destroy", callback);
    return this;
  },

  id: function() {
    return this.attributes.id
  },

  merge: function(attributes) {
    jQuery.extend(this.attributes, attributes);
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

Model.localStorage = function() {
  if (!window.localStorage) {
    return function() {
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
  }

  return function(klass) {
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

      if (jQuery.inArray(uid, uids) === -1) {
        uids.push(uid)
        writeIndex(uids)
      }
    }
    var removeFromIndex = function(uid) {
      var uids = readIndex()
      var index = jQuery.inArray(uid, uids)

      if (index > -1) {
        uids.splice(index, 1)
        writeIndex(uids)
      }
    }
    var store = function(model) {
      var uid = model.uid,
         data = JSON.stringify(model.attr())
      localStorage.setItem(uid, data)
      addToIndex(uid)
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

        var uids = readIndex()
        var models = []
        var attributes, model, uid

        for (var i = 0, length = uids.length; i < length; i++) {
          uid = uids[i]
          attributes = JSON.parse(localStorage[uid])
          model = new klass(attributes)
          model.uid = uid
          models.push(model)
        }

        callback(models)
      },

      update: function(model, callback) {
        store(model)
        callback(true)
      }
    }
  }
}

Model.Log = function() {
  if (window.console) window.console.log.apply(window.console, arguments);
};

Model.REST = function(resource, methods) {
	var PARAM_NAME_MATCHER = /:([\w\d]+)/g;
  var resource_param_names = (function() {
    var resource_param_names = []
    var param_name

    while ((param_name = PARAM_NAME_MATCHER.exec(resource)) !== null) {
      resource_param_names.push(param_name[1])
    }

    return resource_param_names
  })()

  var rest_persistence = jQuery.extend({
		path: function(model) {
      var path = resource;
      $.each(resource_param_names, function(i, param) {
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
        var attributes = model.attr();
        delete attributes.id;
        params = {};
        params[model.constructor._name.toLowerCase()] = attributes;
      } else {
        params = null;
      }
      if(jQuery.ajaxSettings.data){
        params = jQuery.extend({}, jQuery.ajaxSettings.data, params)
      }
      return JSON.stringify(params)
    },

    read: function(callback) {
      var klass = this.klass

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
      var data = jQuery.inArray(method, ["DELETE", "GET"]) > -1 ?
        undefined : this.params(model);

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

  return function(klass) {
    rest_persistence.klass = klass
    return rest_persistence
  }
};

// TODO: Remove in v1 if it ever gets there.
Model.RestPersistence = Model.REST

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
}

Model.REST.parseResponseData = function(xhr) {
  try {
    return /\S/.test(xhr.responseText) ?
      jQuery.parseJSON(xhr.responseText) :
      undefined;
  } catch(e) {
    Model.Log(e);
  }
}

Model.UID = {
  counter: 0,

  generate: function() {
    return [new Date().valueOf(), this.counter++].join("-")
  },

  reset: function() {
    this.counter = 0
    return this
  }
}

Model.VERSION = "0.9.1"
