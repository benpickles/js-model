Model.Base = (function() {
  function Base() {}
  Base.prototype = jQuery.extend({}, Model.Callbacks, Model.InstanceMethods)
  return Base
})();
