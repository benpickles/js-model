module("Model.LocalStoragePlusRest")

localStorageTest("OFFLINE read, create, update, destroy", function() {
  Model.LocalStoragePlusRest._online = false

  var Post = Model("post", { persistence: Model.LocalStoragePlusRest("/lsr-posts") })

  Post.persistence.read(function(models) {
    equals(models.length, 0)
  })

  localStorage.setItem("post-1", JSON.stringify({ id: 1, foo: "a" }))
  localStorage.setItem("post-2", JSON.stringify({ id: 2, foo: "b" }))
  localStorage.setItem("post-collection", '["post-1","post-2"]')

  Post.load(function(models) {
    equals(models.length, 2)

    var post1 = models[0]
    var post2 = models[1]

    equals(post1.uid, "post-1")
    same(post1.attr(), { id: 1, foo: "a" })
    equals(post2.uid, "post-2")
    same(post2.attr(), { id: 2, foo: "b" })
  })

  var post3 = new Post({ foo: "c" })
  post3.uid = "post-3"
  post3.save()

  equals(Post.count(), 3)

  equals(localStorage.getItem("post-create"), '["post-3"]')
  ok(!localStorage.getItem("post-update"))
  ok(!localStorage.getItem("post-destroy"))

  post3.attr("foo", "c-").save()

  equals(localStorage.getItem("post-create"), '["post-3"]')
  ok(!localStorage.getItem("post-update"))
  ok(!localStorage.getItem("post-destroy"))

  Post.find(1).attr("foo", "a-").save()

  equals(localStorage.getItem("post-create"), '["post-3"]')
  equals(localStorage.getItem("post-update"), '["post-1"]')
  ok(!localStorage.getItem("post-destroy"))

  Post.find(2).destroy()

  equals(Post.count(), 2)
  equals(localStorage.getItem("post-create"), '["post-3"]')
  equals(localStorage.getItem("post-update"), '["post-1"]')
  equals(localStorage.getItem("post-destroy"), '[2]')

  post3.destroy()

  equals(Post.count(), 1)
  equals(localStorage.getItem("post-create"), '[]')
  equals(localStorage.getItem("post-update"), '["post-1"]')
  equals(localStorage.getItem("post-destroy"), '[2]')

  Post.find(1).destroy()

  equals(Post.count(), 0)
  equals(localStorage.getItem("post-create"), '[]')
  equals(localStorage.getItem("post-update"), '[]')
  equals(localStorage.getItem("post-destroy"), '[2,1]')
})
