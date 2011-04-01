module("Model.Module")

test("extend", function() {
  var A = Model("A")
  var B = Model("B")
  var module = {
    greet: function() { return "Hi " + this._name }
  }
  A.extend(module)
  B.extend(module)

  equal(A.greet(), "Hi A")
  equal(B.greet(), "Hi B")
})

test("include", function() {
  var A = Model("A")
  var B = Model("B")
  var module = {
    greet: function() { return "Hi " + this.attr("name") }
  }
  A.include(module)
  B.include(module)

  equal(new A({ name: "a" }).greet(), "Hi a")
  equal(new B({ name: "b" }).greet(), "Hi b")
})
