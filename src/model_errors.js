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

  on: function(attribute) {
    return this.errors[attribute] || [];
  }
}
