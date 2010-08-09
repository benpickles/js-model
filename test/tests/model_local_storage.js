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

  Post.load(function() {
    var post1 = Post.first()
    var post2 = Post.last()

    equals(2, Post.count())
    equals("post-a", post1.uid)
    same({ a: "a" }, post1.attr())
    equals("post-b", post2.uid)
    same({ b: "b" }, post2.attr())
  })
})

localStorageTest("create, update, destroy", function() {
  var Post = Model("post", { persistence: Model.LocalStorage })
  var post = new Post({ title: "foo", foo: "bar" })
  post.save()

  equals(1, localStorage.length)
  same({ title: "foo", foo: "bar" }, JSON.parse(localStorage[post.uid]))

  post.attr({ title: ".", foo: null, bar: "baz" })
  post.save()

  equals(1, localStorage.length)
  same({ title: ".", foo: null, bar: "baz" }, JSON.parse(localStorage[post.uid]))

  post.destroy()

  equals(0, localStorage.length)
  ok(localStorage[post.uid] === undefined)
})
