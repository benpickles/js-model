module("Model inheritance")

test("methods added to Klass after declaration can be called", function() {
  var Post = Model("post")

  ok(Post.hello === undefined)

  Model.Klass.prototype.hello = function() {
    return "hello"
  }

  equal("hello", Post.hello())

  delete Model.Klass.prototype.hello

  ok(Post.hello === undefined)
})

test("methods added to Instance after an instance has been defined can be called", function() {
  var Post = Model("post")
  var post = Post.instance({ title: "upper" })

  ok(post.attrUpper === undefined)

  Model.Instance.prototype.attrUpper = function(attr) {
    return this.attr(attr).toUpperCase()
  }

  equal("UPPER", post.attrUpper("title"))

  delete Model.Instance.prototype.attrUpper

  ok(post.attrUpper === undefined)
})
