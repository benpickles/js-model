module("Model.REST");

test("read()", 3, function() {
  var Post = Model("post", function() {
    this.use(Model.REST, "/posts")
  })

  var server = this.sandbox.useFakeServer()
  server.respondWith("GET", "/posts", [200, {
    "Content-Type": "application/json"
  }, JSON.stringify([
    { id: 1, title: "Bar" },
    { id: 2, title: "Foo" }
  ])])

  Post.persistence.read(function(models) {
    equal(models.length, 2)

    var post1 = models[0]
    var post2 = models[1]

    deepEqual({ id: 1, title: "Bar" }, post1.attributes)
    deepEqual({ id: 2, title: "Foo" }, post2.attributes)
  })

  server.respond()
})

test("read() with a single instance", 2, function() {
  var Post = Model("post", function() {
    this.use(Model.REST, "/posts")
  })

  var server = this.sandbox.useFakeServer()
  server.respondWith("GET", "/posts", [200, {
    "Content-Type": "application/json"
  }, JSON.stringify({ id: 1, title: "Bar" })])

  Post.persistence.read(function(models) {
    equal(models.length, 1)
    deepEqual({ id: 1, title: "Bar" }, models[0].attributes)
  })

  server.respond()
})

test("create with named params in resource path", function() {
  var Post = Model("post", function() {
    this.use(Model.REST, "/root/:root_id/nested/:nested_id/posts")
  });
  var post = new Post({ title: "Nested", body: "...", root_id: 3, nested_id: 2 });

  this.spy(jQuery, "ajax")

  var server = this.sandbox.useFakeServer()
  server.respondWith("POST", "/root/3/nested/2/posts", [200, {
    "Content-Type": "application/json"
  }, JSON.stringify({ id: 1, title: "Foo" })])

  post.save(function(success) {
    ok(success);
  });

  ok(jQuery.ajax.calledOnce)
  equal(jQuery.ajax.getCall(0).args[0].type, "POST")
  equal(jQuery.ajax.getCall(0).args[0].url, "/root/3/nested/2/posts")

  server.respond()
});

test("update with named params in resource path", function() {
  var Post = Model("post", function() {
    this.use(Model.REST, "/root/:root_id/nested/:nested_id/posts")
  });
  var post = new Post({ id: 1, title: "Nested", body: "...", root_id: 3, nested_id: 2 });
  post.set("title", "Nested amended")

  this.spy(jQuery, "ajax")

  var server = this.sandbox.useFakeServer()
  server.respondWith("PUT", "/root/3/nested/2/posts/1", [200, {
    "Content-Type": "application/json"
  }, JSON.stringify({
    id: 1, title: "Nested", body: "...", root_id: 3, nested_id: 2
  })])

  post.save(function(success) {
    ok(success);
  });

  server.respond()

  ok(jQuery.ajax.calledOnce)
  equal(jQuery.ajax.getCall(0).args[0].type, "PUT")
  equal(jQuery.ajax.getCall(0).args[0].url, "/root/3/nested/2/posts/1")
});

test("update with custom unique_key field", function() {
  var Post = Model("post", function() {
    this.unique_key = '_id'
    this.use(Model.REST, "/posts")
  });
  var post = new Post({ '_id': 1, title: "Foo" });

  this.spy(jQuery, "ajax")

  var server = this.sandbox.useFakeServer()
  server.respondWith("PUT", "/posts/1", [200, {
    "Content-Type": "application/json"
  }, JSON.stringify({
    _id: 1, title: "Foo"
  })])

  post.save(function(success) {
    ok(success);
  });

  ok(jQuery.ajax.calledOnce)
  deepEqual(JSON.parse(jQuery.ajax.getCall(0).args[0].data), {
    post: { title: "Foo" }
  })

  server.respond()
});

test("update single resource", 3, function() {
  var User = Model("user", function() {
    this.use(Model.REST, "/user", {
      update_path: function () {
        return this.read_path()
      }
    })
  });
  var user = new User({ 'id': 1, email: "bob@example.com" });

  this.spy(jQuery, "ajax")

  var server = this.sandbox.useFakeServer()
  server.respondWith("PUT", "/user", [200, {
    "Content-Type": "application/json"
  }, JSON.stringify({
    id: 1, email: "bob@example.com"
  })])

  user.save(function(success) {
    ok(success, "save() wasn't successful");
  });

  ok(jQuery.ajax.calledOnce)
  deepEqual(JSON.parse(jQuery.ajax.getCall(0).args[0].data), {
    user: { email: "bob@example.com" }
  })

  server.respond()
})

test("destroy with named params in resource path", function() {
  var Post = Model("post", function() {
    this.use(Model.REST, "/root/:root_id/nested/:nested_id/posts")
  });
  var post = new Post({ id: 1, title: "Nested", body: "...", root_id: 3, nested_id: 2 });

  this.spy(jQuery, "ajax")

  var server = this.sandbox.useFakeServer()
  server.respondWith("DELETE", "/root/3/nested/2/posts/1", [200, {
    "Content-Type": "application/json"
  }, ' '])

  post.destroy(function(success) {
    ok(success);
  });

  ok(jQuery.ajax.calledOnce)
  equal(jQuery.ajax.getCall(0).args[0].type, "DELETE")
  equal(jQuery.ajax.getCall(0).args[0].url, "/root/3/nested/2/posts/1")
  deepEqual(JSON.parse(jQuery.ajax.getCall(0).args[0].data), {
    post: { title: 'Nested', body: "...", root_id: 3, nested_id: 2 }
  })

  server.respond()
});

test("create", function() {
  var Post = Model("post", function() {
    this.use(Model.REST, "/posts")
  });
  var post = new Post({ title: "Foo", body: "..." });

  equal(Post.collection.length, 0);

  this.spy(jQuery, "ajax")

  var server = this.sandbox.useFakeServer()
  server.respondWith("POST", "/posts", [200, {
    "Content-Type": "application/json"
  }, JSON.stringify({
    id: 1, title: "Foo amended", body: "...", foo: "bar"
  })])

  post.save(function(success) {
    ok(success);
    ok(this === post);
    deepEqual(post.attributes, { id: 1, title: "Foo amended", body: "...", foo: "bar" });
    equal(post.id(), 1);
    equal(Post.collection.length, 1);
  });

  ok(jQuery.ajax.calledOnce)
  equal(jQuery.ajax.getCall(0).args[0].type, "POST")
  equal(jQuery.ajax.getCall(0).args[0].url, "/posts")
  deepEqual(JSON.parse(jQuery.ajax.getCall(0).args[0].data), {
    post: { title: "Foo", body: "..." }
  })

  server.respond()
});

test("create - 422 response (failed validations)", function() {
  var Post = Model("post", function() {
    this.use(Model.REST, "/posts")
  });
  var post = new Post();
  post.set("title", "Foo")

  var server = this.sandbox.useFakeServer()
  server.respondWith("POST", "/posts", [422, {
    "Content-Type": "application/json"
  }, JSON.stringify({
    title: ['should not be "Foo"', 'should be "Bar"']
  })])

  post.save(function(success) {
    ok(!success);
    ok(this === post);
    deepEqual(this.attributes, {}, "changes should not have been merged");
    deepEqual(this.get(), { title: "Foo" })
    deepEqual(this.errors.on("title"), ['should not be "Foo"', 'should be "Bar"']);
  });

  server.respond()
});

test("create failure", function() {
  var Post = Model("post", function() {
    this.use(Model.REST, "/posts")
  });
  var post = new Post();
  post.set({ title: "Foo", body: "..." })

  equal(Post.collection.length, 0);

  var server = this.sandbox.useFakeServer()
  server.respondWith("POST", "/posts", [500, {
    "Content-Type": "application/json"
  }, 'bang'])

  post.save(function(success) {
    ok(!success);
    ok(this === post);
    deepEqual(this.attributes, {}, "changes should not have been merged");
    deepEqual(this.get(), { title: "Foo", body: "..." })
    equal(Post.collection.length, 0);
  });

  server.respond()
});

test("create with AjaxSetup", function() {
  jQuery.ajaxSetup({
    data: {
      socket_id: '111'
    }
  })
  
  var Post = Model("post", function() {
    this.use(Model.REST, "/posts")
  });
  var post = new Post({ title: "Foo", body: "..." });

  equal(Post.collection.length, 0);

  this.spy(jQuery, "ajax")

  var server = this.sandbox.useFakeServer()
  server.respondWith("POST", "/posts", [200, {
    "Content-Type": "application/json"
  }, JSON.stringify({ id: 1, title: "Foo", body: "..." })])

  post.save(function(success) {
    ok(success);
    ok(this === post);
  });

  ok(jQuery.ajax.calledOnce)
  deepEqual(JSON.parse(jQuery.ajax.getCall(0).args[0].data), {
    socket_id: "111", post: { title: "Foo", body: "..." }
  })

  server.respond()

  delete jQuery.ajaxSettings.data.socket_id
});

test("update", function() {
  var Post = Model("post", function() {
    this.use(Model.REST, "/posts")
  });
  var post = new Post({ id: 1, title: "Foo", body: "..." });
  post.set("title", "Bar")

  this.spy(jQuery, "ajax")

  var server = this.sandbox.useFakeServer()
  server.respondWith("PUT", "/posts/1", [200, {
    "Content-Type": "application/json"
  }, JSON.stringify({ id: 1, title: "Bar amended", body: "..." })])

  post.save(function(success) {
    ok(success);
    ok(this === post);
    deepEqual(post.attributes, { id: 1, title: "Bar amended", body: "..." }, "changes should be applied")
    deepEqual(post.changes, {})
  });

  ok(jQuery.ajax.calledOnce)
  equal(jQuery.ajax.getCall(0).args[0].type, "PUT")
  equal(jQuery.ajax.getCall(0).args[0].url, "/posts/1")
  deepEqual(JSON.parse(jQuery.ajax.getCall(0).args[0].data), {
    post: { title: "Bar", body: "..." }
  })

  server.respond()
});

test("update - blank response (Rails' `head :ok`)", function() {
  var Post = Model("post", function() {
    this.use(Model.REST, "/posts")
  });
  var post = new Post({ id: 1, title: "Foo", body: "..." });
  post.set("title", "Bar")

  var server = this.sandbox.useFakeServer()
  server.respondWith("PUT", "/posts/1", [200, {
    "Content-Type": "application/json"
  }, " "])

  post.save(function(success) {
    ok(success)
  });

  server.respond()
});

test("destroy - blank response (Rails' `head :ok`)", function() {
  var Post = Model("post", function() {
    this.use(Model.REST, "/posts")
  });
  var post = new Post({ id: 1, title: "Foo", body: "..." });

  var server = this.sandbox.useFakeServer()
  server.respondWith("DELETE", "/posts/1", [200, {
    "Content-Type": "application/json"
  }, " "])

  post.destroy(function(success) {
    ok(success)
  })

  server.respond()
});

test("update - 422 response (failed validations)", function() {
  var Post = Model("post", function() {
    this.use(Model.REST, "/posts")
  });
  var post = new Post({ id: 1 });
  post.set("title", "Foo")

  var server = this.sandbox.useFakeServer()
  server.respondWith("PUT", "/posts/1", [422, {
    "Content-Type": "application/json"
  }, JSON.stringify({
    title: ['should not be "Foo"', 'should be "Bar"']
  })])

  post.save(function(success) {
    ok(!success);
    ok(this === post);
    deepEqual(this.attributes, { id: 1 }, "changes should not have been merged");
    deepEqual(this.get(), { id: 1, title: "Foo" })
    deepEqual(this.errors.on("title"), ['should not be "Foo"', 'should be "Bar"']);
  });

  server.respond()
});

test("update failure", function() {
  var Post = Model("post", function() {
    this.use(Model.REST, "/posts-failure")
  });
  var post = new Post({ id: 1, title: "Foo" });
  post.set("title", "Bar")

  var server = this.sandbox.useFakeServer()
  server.respondWith("PUT", "/posts/1", [500, {
    "Content-Type": "application/json"
  }, "bang"])

  post.save(function(success) {
    ok(!success);
    ok(this === post);
    deepEqual(this.attributes, { id: 1, title: "Foo" }, "changes should not have been merged");
    deepEqual(this.changes, { title: "Bar" });
  });

  server.respond()
});

test("destroy", function() {
  var Post = Model("post", function() {
    this.use(Model.REST, "/posts")
  });
  var post = new Post({ id: 1, title: "Foo", body: "..." });

  this.spy(jQuery, "ajax")

  var server = this.sandbox.useFakeServer()
  server.respondWith("DELETE", "/posts/1", [200, {
    "Content-Type": "application/json"
  }, " "])

  post.destroy(function(success) {
    ok(success);
  });

  ok(jQuery.ajax.calledOnce)
  equal(jQuery.ajax.getCall(0).args[0].type, "DELETE")
  equal(jQuery.ajax.getCall(0).args[0].url, "/posts/1")
  deepEqual(JSON.parse(jQuery.ajax.getCall(0).args[0].data), {
    post: { title: "Foo", body: "..." }
  })

  server.respond()
});

test("destroy failure", function() {
  var Post = Model("post", function() {
    this.use(Model.REST, "/posts")
  });
  var post = new Post({ id: 1, title: "Foo" });

  Post.collection.add(post);

  equal(Post.collection.length, 1);

  var server = this.sandbox.useFakeServer()
  server.respondWith("DELETE", "/posts/1", [500, {
    "Content-Type": "application/json"
  }, " "])

  post.destroy(function(success) {
    ok(!success);
    ok(this === post);
    equal(Post.collection.length, 1);
  });

  server.respond()
});

test("destroy - 422 response (failed validations)", function() {
  var Post = Model("post", function() {
    this.use(Model.REST, "/posts")
  });
  var post = new Post({ id: 1, title: "Foo" });

  var server = this.sandbox.useFakeServer()
  server.respondWith("DELETE", "/posts/1", [422, {
    "Content-Type": "application/json"
  }, JSON.stringify({
    title: ["must do something else before deleting"]
  })])

  post.destroy(function(success) {
    ok(!success);
    ok(this === post);
    deepEqual(this.errors.on("title"), ["must do something else before deleting"]);
  });

  server.respond()
});

test("create event", 1, function() {
  var Post = Model("post", function() {
    this.use(Model.REST, "/posts")
  });

  var server = this.sandbox.useFakeServer()
  server.respondWith("POST", "/posts", [200, {
    "Content-Type": "application/json"
  }, JSON.stringify({ id: 1 })])

  var post = new Post()
  post.on("save", function() { ok(true) })
  post.save()

  server.respond()
});

test("update event", 1, function() {
  var Post = Model("post", function() {
    this.use(Model.REST, "/posts")
  })

  var server = this.sandbox.useFakeServer()
  server.respondWith("PUT", "/posts/1", [200, {
    "Content-Type": "application/json"
  }, JSON.stringify({ id: 1 })])

  var post = new Post({ id: 1 })
  post.on("save", function() { ok(true) })
  post.save()

  server.respond()
})

test("destroy event", 1, function() {
  var Post = Model("post", function() {
    this.use(Model.REST, "/posts")
  })

  var server = this.sandbox.useFakeServer()
  server.respondWith("DELETE", "/posts/1", [200, {
    "Content-Type": "application/json"
  }, " "])

  var post = new Post({ id: 1 })
  post.on("destroy", function() { ok(true) })
  post.destroy()

  server.respond()
})

test("custom methods", function() {
  var Post = Model("post", function() {
    this.use(Model.REST, "/posts", {
      newRecord: function() {
        return "blah"
      }
    })
  })

  equal(new Post().newRecord(), "blah")
})
