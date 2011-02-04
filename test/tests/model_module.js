module("Model.Module")

test("extend", function() {
  var A = Model("A")
  var B = Model("B")
  var module = {
    greet: function() { return "Hi " + this._name }
  }
  A.extend(module)
  B.extend(module)

  equals(A.greet(), "Hi A")
  equals(B.greet(), "Hi B")
})
