module("Model.localStorage", {
  teardown: function() {
    if (window.localStorage) window.localStorage.clear()
  }
})

test("read", function() {
  if (!window.localStorage)
    return ok(false, "localStorage not supported in this browser")

  var Post = Model("post", function() {
    this.use(Model.localStorage)
  })

  Post.persistence.read(function(models) {
    equal(models.length, 0)
  })

  localStorage.setItem("post-a", JSON.stringify({ a: "a" }))
  localStorage.setItem("post-b", JSON.stringify({ b: "b" }))
  localStorage.setItem("post-collection", '["post-a","post-b"]')

  Post.persistence.read(function(models) {
    equal(models.length, 2)

    var post1 = models[0]
    var post2 = models[1]

    equal("post-a", post1.uid)
    deepEqual({ a: "a" }, post1.attr())
    equal("post-b", post2.uid)
    deepEqual({ b: "b" }, post2.attr())

    Post.collection = [post1, post2]
  })

  Post.persistence.read(function(models) {
    equal(models.length, 0, "filters models already in the collection")
  })
})

test("create, update, destroy", function() {
  if (!window.localStorage)
    return ok(false, "localStorage not supported in this browser")

  var Post = Model("post", function() {
    this.use(Model.localStorage)
  })

  equal(Post.collection.length, 0)
  equal(localStorage.length, 0)

  var post = new Post({ title: "foo", foo: "bar" })
  post.save()

  equal(Post.collection.length, 1)
  equal(localStorage.length, 2)
  deepEqual({ title: "foo", foo: "bar" }, JSON.parse(localStorage[post.uid]))
  equal(localStorage["post-collection"], '["' + post.uid + '"]',
    "should be stored in localStorage")

  post.attr({ title: ".", foo: null, bar: "baz" })
  post.save()

  equal(Post.collection.length, 1)
  equal(localStorage.length, 2)
  deepEqual({ title: ".", foo: null, bar: "baz" }, JSON.parse(localStorage[post.uid]))
  equal(localStorage["post-collection"], '["' + post.uid + '"]',
    "should not alter localStorage list")

  post.destroy()

  equal(Post.collection.length, 0)
  equal(localStorage.length, 1)
  ok(!localStorage[post.uid])
  equal(localStorage["post-collection"], "[]",
    "should be removed from localStorage list")

  Post.persistence.read(function(models) {
    equal(models.length, 0)
  })
})
