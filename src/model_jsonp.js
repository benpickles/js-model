Model.JSONP = function(url, options) {
  var noop = function() {}
  var settings = {
    filter: function(data) { return data },
    error: noop,
    timeout: 5000
  }

  if (options) jQuery.extend(settings, options)

  return function(klass) {
    return {
      create: noop,
      update: noop,
      destroy: noop,

      read: function(callback) {
        var success = false

        jQuery.ajax({
          url: url,
          dataType: "jsonp",
          success: function(data) {
            success = true
            data = jQuery.makeArray(settings.filter(data))
            var models = []

            for (var i = 0, length = data.length; i < length; i++) {
              models.push(new klass(data[i]))
            }

            callback(models)
          }
        })

        setTimeout(function() {
          if (!success) {
            if (settings.error() !== false) callback([])
          }
        }, settings.timeout)

        return this
      }
    }
  }
}
