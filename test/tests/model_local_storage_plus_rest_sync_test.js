module("Model.LocalStoragePlusRest sync")

localStorageTest("Simple syncing", function() {
  var Post = Model("post", { persistence: Model.LocalStoragePlusRest("/sync/simple") })

  Post.persistence()local.create(new Post({ id: 1, foo: "a" }))
  Post.persistence()local.create(new Post({ id: 2, foo: "b" }))

  Post.load()

  equal(Post.count(), 2)

  stop()

  Post.persistence()sync(function() {
    start()

    equal(Post.count(), 2)
    equal(Post.find(1).attributes.foo, "AA")
    ok(!Post.find(1).changes.hasOwnProperty("foo"))
    ok(!Post.find(2))
    deepEqual(Post.find(3).attributes.foo, "c")
  })
})

localStorageTest("Simple syncing", function() {
  var Post = Model("post", { persistence: Model.LocalStoragePlusRest("/sync/posts") })

  Post.persistence()local.create(new Post({ id: 1, foo: "a" }))
  Post.persistence()local.create(new Post({ id: 2, foo: "b" }))

  Post.load()

  equal(Post.count(), 2)

  stop()

  Post.persistence()sync(function() {
    start()

    equal(Post.count(), 3)
    equal(Post.find(1).attributes.foo, "AA")
    ok(!Post.find(1).changes.hasOwnProperty("foo"))
    ok(!Post.find(2))
    deepEqual(Post.find(3).attributes.foo, "c")
  })
})
