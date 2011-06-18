module("Model plugins")

test("applied in factory", 3, function() {
  var obj = {}

  function Foo(klass, a, b) {
    klass.foo = "foo"
    equal(a, "a")
    ok(b === obj)
  }

  var Post = Model("post", function() {
    this.use(Foo, "a", obj)
  })

  equal(Post.foo, "foo")
})

test("applied outside factory", 4, function() {
  var obj = {}

  function Foo(klass, a, b) {
    klass.foo = "foo"
    equal(a, "a")
    ok(b === obj)
  }

  var Post = Model("post")
  var rtn = Post.use(Foo, "a", obj)
  ok(rtn === Post)
  equal(Post.foo, "foo")
})
