module("Model inheritance")

test("methods added to Model.Base after an instance has been defined", function() {
  var Post = Model("post")
  var post = new Post({ title: "upper" })

  ok(post.attrUpper === undefined)

  Model.Base.prototype.attrUpper = function(attr) {
    return this.attr(attr).toUpperCase()
  }

  equal("UPPER", post.attrUpper("title"))

  delete Model.Base.prototype.attrUpper

  ok(post.attrUpper === undefined)
})
