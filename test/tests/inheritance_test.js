module("Model inheritance")

test("methods added to Model.Model after an instance has been defined", function() {
  var Post = Model("post")
  var post = new Post({ title: "upper" })

  ok(post.attrUpper === undefined)

  Model.Model.prototype.attrUpper = function(attr) {
    return this.get(attr).toUpperCase()
  }

  equal("UPPER", post.attrUpper("title"))

  delete Model.Model.prototype.attrUpper

  ok(post.attrUpper === undefined)
})
