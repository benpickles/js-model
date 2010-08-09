module("Model.LocalStorage")

var localStorageTest = function(name, func) {
  test(name, function() {
    localStorage.clear()
    func()
  })
}

localStorageTest("read", function() {
  var Post = Model("post", { persistence: Model.LocalStorage })

  localStorage.setItem("post-a", JSON.stringify({ a: "a" }))
  localStorage.setItem("post-b", JSON.stringify({ b: "b" }))
  localStorage.setItem("post-collection", '["post-a","post-b"]')

  Post.persistence.read(function(data) {
    equals(data.length, 2)

    var post1 = data[0]
    var post2 = data[1]

    equals("post-a", post1.uid)
    same({ a: "a" }, post1.attr())
    equals("post-b", post2.uid)
    same({ b: "b" }, post2.attr())
  })
})

localStorageTest("create, update, destroy", function() {
  var Post = Model("post", { persistence: Model.LocalStorage })

  equals(Post.count(), 0)

  var post = new Post({ title: "foo", foo: "bar" })
  post.save()

  equals(Post.count(), 1)
  equals(localStorage.length, 1)
  same({ title: "foo", foo: "bar" }, JSON.parse(localStorage[post.uid]))

  post.attr({ title: ".", foo: null, bar: "baz" })
  post.save()

  equals(Post.count(), 1)
  equals(localStorage.length, 1)
  same({ title: ".", foo: null, bar: "baz" }, JSON.parse(localStorage[post.uid]))

  post.destroy()

  equals(Post.count(), 0)
  equals(localStorage.length, 0)
  ok(localStorage[post.uid] === undefined)
})
