Model.JSONP = function(url, options) {
  var settings = {
    filter: function(data) { return data }
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
            data = jQuery.makeArray(settings.filter(data))
            var models = []

            for (var i = 0, length = data.length; i < length; i++) {
              models.push(new klass(data[i]))
            }

            callback(models)
          }
        })

        return this
      }
    }
  }
}
