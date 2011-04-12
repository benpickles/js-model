Model.Base = (function() {
  function Base() {}
  Base.prototype = Model.Utils.extend({}, Model.Callbacks, Model.InstanceMethods)
  return Base
})();
