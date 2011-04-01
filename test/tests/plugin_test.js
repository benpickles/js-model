module("Model plugins")

test("blah", 8, function() {
  function Foo(klass, a, b) {
    klass.foo = "foo"
    equal(a, "a")
    ok(b === obj)
  }

  var obj = {}

  var Post = Model("post", function() {
    this.use(Foo, "a", obj)
  })

  equal(Post.foo, "foo")
  delete Post.foo
  ok(Post.foo === undefined)

  var rtn = Post.use(Foo, "a", obj)
  ok(rtn === Post)
  equal(Post.foo, "foo")
})
