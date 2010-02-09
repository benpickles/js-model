var AjaxSpy = {
  oldAjax: null,
  requests: [],

  clear: function() {
    AjaxSpy.requests = [];
  },

  start: function() {
    // Don't die if it's already been started.
    if (this.oldAjax) return;

    this.oldAjax = jQuery.ajax;

    jQuery.ajax = function(options) {
      AjaxSpy.requests.push(options);
      AjaxSpy.oldAjax.call(jQuery, options);
    };
  },

  stop: function() {
    jQuery.ajax = this.oldAjax;
    this.oldAjax = null;
  },

  stubData: function(data) {
    jQuery.httpData = function() {
      return data;
    };
  },

  stubData: function(data) {
    this.oldHttpData = jQuery.httpData;
    jQuery.httpData = function() {
      return data;
    };
  },

  unstubData: function() {
    jQuery.httpData = this.oldHttpData;
    this.oldHttpData = null;
  }
};
