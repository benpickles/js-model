var AjaxSpy = {
  oldAjax: null,
  requests: [],

  clear: function() {
    AjaxSpy.requests = [];
  },

  start: function() {
    this.clear();

    // Don't die if it's already been started.
    if (this.oldAjax) return;

    this.oldAjax = jQuery.ajax;

    jQuery.ajax = function(options) {
      AjaxSpy.requests.push(options);
      AjaxSpy.oldAjax.call(jQuery, options);
    };
  },

  stop: function() {
    this.clear();
    jQuery.ajax = this.oldAjax;
    this.oldAjax = null;
  }
};
