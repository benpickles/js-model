module("Model.JSONP")

asyncTest("read", function() {
  var Post = Model("post", {
    persistence: Model.JSONP("/jsonp/posts")
  })

  Post.persistence()read(function(models) {
    start()
    equal(models.length, 2)
  })
})

asyncTest("successful callback shouldn't be called if the timeout has already occurred", function() {
  var Post = Model("post", {
    persistence: Model.JSONP("/jsonp/posts", {
      timeout: 1000
    })
  })

  Post.persistence()read(function(models) {
    start()
    equal(models.length, 2)
  })
})
