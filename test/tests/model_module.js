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

test("include", function() {
  var A = Model("A")
  var B = Model("B")
  var module = {
    greet: function() { return "Hi " + this.attr("name") }
  }
  A.include(module)
  B.include(module)

  equals(new A({ name: "a" }).greet(), "Hi a")
  equals(new B({ name: "b" }).greet(), "Hi b")
})
