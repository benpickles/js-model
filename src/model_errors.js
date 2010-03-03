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
    var errors = this.errors[attribute];

    if (!errors) {
      return;
    } else if (errors.length == 1) {
      return errors[0];
    } else {
      return errors;
    }
  }
}
