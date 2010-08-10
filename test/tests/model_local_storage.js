module("Model.LocalStorage")

var localStorageTest = function(name, func) {
  test(name, function() {
    localStorage.clear()
    func()
  })
}

localStorageTest("read", function() {
  var Post = Model("post", { persistence: Model.LocalStorage })

  Post.persistence.read(function(models) {
    equals(models.length, 0)
  })

  localStorage.setItem("post-a", JSON.stringify({ a: "a" }))
  localStorage.setItem("post-b", JSON.stringify({ b: "b" }))
  localStorage.setItem("post-collection", '["post-a","post-b"]')

  Post.persistence.read(function(models) {
    equals(models.length, 2)

    var post1 = models[0]
    var post2 = models[1]

    equals("post-a", post1.uid)
    same({ a: "a" }, post1.attr())
    equals("post-b", post2.uid)
    same({ b: "b" }, post2.attr())
  })
})

localStorageTest("create, update, destroy", function() {
  var Post = Model("post", { persistence: Model.LocalStorage })

  equals(Post.count(), 0)
  equals(localStorage.length, 0)

  var post = new Post({ title: "foo", foo: "bar" })
  post.save()

  equals(Post.count(), 1)
  equals(localStorage.length, 2)
  same({ title: "foo", foo: "bar" }, JSON.parse(localStorage[post.uid]))
  equals(localStorage["post-collection"], '["' + post.uid + '"]',
    "should be stored in localStorage")

  Post.persistence.read(function(models) {
    equals(models.length, 1)
    same(models[0].attr(), post.attr())
  })

  post.attr({ title: ".", foo: null, bar: "baz" })
  post.save()

  equals(Post.count(), 1)
  equals(localStorage.length, 2)
  same({ title: ".", foo: null, bar: "baz" }, JSON.parse(localStorage[post.uid]))
  equals(localStorage["post-collection"], '["' + post.uid + '"]',
    "should not alter localStorage list")

  Post.persistence.read(function(models) {
    equals(models.length, 1)
    same(models[0].attr(), post.attr())
  })

  post.destroy()

  equals(Post.count(), 0)
  equals(localStorage.length, 1)
  ok(localStorage[post.uid] === undefined)
  equals(localStorage["post-collection"], "[]",
    "should be removed from localStorage list")

  Post.persistence.read(function(models) {
    equals(models.length, 0)
  })
})
