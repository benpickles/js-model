Model.Errors = function() {
  this.errors = {};
  this.length = 0;
};

Model.Errors.prototype = {
  add: function(attribute, message) {
    if (!this.errors[attribute]) this.errors[attribute] = [];
    this.errors[attribute].push(message);
    this.length++;
  },

  clear: function() {
    this.errors = {};
    this.length = 0;
  },

  each: function(func) {
    for (var attribute in this.errors) {
      for (var i = 0; i < this.errors[attribute].length; i++) {
        func(attribute, this.errors[attribute][i]);
      }
    }
  },

  on: function(attribute) {
    return this.errors[attribute] || [];
  }
}
