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
