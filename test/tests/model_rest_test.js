module("Model.REST");

asyncTest("read", 3, function() {
  var Post = Model("post", function() {
    this.persistence(Model.REST, "/posts")
  })

  Post.persistence().read(function(models) {
    equal(models.length, 2)

    var post1 = models[0]
    var post2 = models[1]

    deepEqual({ id: 1, title: "Bar" }, post1.attributes)
    deepEqual({ id: 2, title: "Foo" }, post2.attributes)

    start()
  })
})

asyncTest("read", 2, function() {
  var Post = Model("post", function() {
    this.persistence(Model.REST, "/posts-single")
  })

  Post.persistence().read(function(models) {
    equal(models.length, 1)
    deepEqual({ id: 1, title: "Bar" }, models[0].attributes)
    start()
  })
})

test("create with named params in resource path", function() {
  var Post = Model("post", function() {
    this.persistence(Model.REST, "/root/:root_id/nested/:nested_id/posts")
  });
  var post = Post.instance({ title: "Nested", body: "...", root_id: 3, nested_id: 2 });

  AjaxSpy.start();
  stop();

  post.save(function(success) {
    ok(success);
    start();
  });

  equal(AjaxSpy.requests.length, 1, "one request should have been made");

  var request = AjaxSpy.requests.shift();
  
  equal(request.type, "POST");
  equal(request.url, "/root/3/nested/2/posts");
});

test("update with named params in resource path", function() {
  var Post = Model("post", function() {
    this.persistence(Model.REST, "/root/:root_id/nested/:nested_id/posts")
  });
  var post = Post.instance({ id: 1, title: "Nested", body: "...", root_id: 3, nested_id: 2 });
  post.attr("title", "Nested amended");

  AjaxSpy.start();
  stop();

  post.save(function(success) {
    ok(success);
    start();
  });

  equal(AjaxSpy.requests.length, 1, "one request should have been made");

  var request = AjaxSpy.requests.shift();

  equal(request.type, "PUT");
  equal(request.url, "/root/3/nested/2/posts/1");
});

test("update with custom unique_key field", function() {
  var Post = Model("post", function() {
    this.unique_key = '_id'
    this.persistence(Model.REST, "/root/:root_id/nested/:nested_id/posts")
  });
  var post = Post.instance({ '_id': 1, title: "Nested", body: "...", root_id: 3, nested_id: 2 });

  AjaxSpy.start();
  stop();

  post.save(function(success) {
    ok(success);
    start();
  });

  var request = AjaxSpy.requests.shift();

  deepEqual(JSON.parse(request.data), {post: {title: 'Nested', body: "...", root_id: 3, nested_id: 2}});
});


test("destroy with named params in resource path", function() {
  var Post = Model("post", function() {
    this.persistence(Model.REST, "/root/:root_id/nested/:nested_id/posts")
  });
  var post = Post.instance({ id: 1, title: "Nested", body: "...", root_id: 3, nested_id: 2 });

  AjaxSpy.start();
  stop();

  post.destroy(function(success) {
    ok(success);
    start();
  });

  equal(AjaxSpy.requests.length, 1, "one request should have been made");

  var request = AjaxSpy.requests.shift();

  equal(request.type, "DELETE");
  equal(request.url, "/root/3/nested/2/posts/1");
  deepEqual(JSON.parse(request.data), {post: {title: 'Nested', body: "...", root_id: 3, nested_id: 2}});
});

test("create", function() {
  var Post = Model("post", function() {
    this.persistence(Model.REST, "/posts")
  });
  var post = Post.instance({ title: "Foo", body: "..." });

  equal(Post.count(), 0);

  AjaxSpy.start();

  stop();

  post.save(function(success) {
    ok(success);
    ok(this === post);
    deepEqual(post.attributes, { id: 1, title: "Foo amended", body: "...", foo: "bar" });
    equal(post.id(), 1);
    equal(Post.count(), 1);
    start();
  });

  equal(AjaxSpy.requests.length, 1, "one request should have been made");

  var request = AjaxSpy.requests.shift();

  equal(request.type, "POST");
  equal(request.url, "/posts");
  deepEqual(JSON.parse(request.data), { post: { title: "Foo", body: "..." } });
});

test("create - 422 response (failed validations)", function() {
  var Post = Model("post", function() {
    this.persistence(Model.REST, "/posts-validations")
  });
  var post = Post.instance();
  post.attr("title", "Foo");

  stop();

  post.save(function(success) {
    ok(!success);
    ok(this === post);
    deepEqual(this.attributes, {}, "changes should not have been merged");
    deepEqual(this.attr(), { title: "Foo" });
    deepEqual(this.errors.on("title"), ['should not be "Foo"', 'should be "Bar"']);
    start();
  });
});

test("create failure", function() {
  var Post = Model("post", function() {
    this.persistence(Model.REST, "/posts-failure")
  });
  var post = Post.instance();
  post.attr({ title: "Foo", body: "..." });

  equal(Post.count(), 0);

  stop();

  post.save(function(success) {
    ok(!success);
    ok(this === post);
    deepEqual(this.attributes, {}, "changes should not have been merged");
    deepEqual(this.attr(), { title: "Foo", body: "..." });
    equal(Post.count(), 0);
    start();
  });
});

test("create with AjaxSetup", function() {
  jQuery.ajaxSetup({
    data: {
      socket_id: '111'
    }
  })
  
  var Post = Model("post", function() {
    this.persistence(Model.REST, "/posts")
  });
  var post = Post.instance({ title: "Foo", body: "..." });

  equal(Post.count(), 0);

  AjaxSpy.start();

  stop();

  post.save(function(success) {
    ok(success);
    ok(this === post);
    start();
  });

  equal(AjaxSpy.requests.length, 1, "one request should have been made");

  var request = AjaxSpy.requests.shift();
  deepEqual(JSON.parse(request.data), { socket_id: '111', post: { title: "Foo", body: "..." } });

  delete jQuery.ajaxSettings.data.socket_id
});

test("update", function() {
  var Post = Model("post", function() {
    this.persistence(Model.REST, "/posts")
  });
  var post = Post.instance({ id: 1, title: "Foo", body: "..." });
  post.attr("title", "Bar");

  AjaxSpy.start();

  stop();

  post.save(function(success) {
    ok(success);
    ok(this === post);
    deepEqual(post.attributes, { id: 1, title: "Bar amended", body: "..." });
    start();
  });

  equal(AjaxSpy.requests.length, 1, "one request should have been made");

  var request = AjaxSpy.requests.shift();

  equal(request.type, "PUT");
  equal(request.url, "/posts/1");
  deepEqual(JSON.parse(request.data), { post: { title: "Bar", body: "..." } });
});

test("update - blank response (Rails' `head :ok`)", function() {
  var Post = Model("post", function() {
    this.persistence(Model.REST, "/posts-empty-response")
  });
  var post = Post.instance({ id: 1, title: "Foo", body: "..." });
  post.attr("title", "Bar");

  stop();

  var old_log = Model.Log;
  var logged = [];

  Model.Log = function() {
    logged.push(arguments);
  };

  post.save(function(success) {
    deepEqual(logged, []);

    post.destroy(function(success) {
      deepEqual(logged, [])
      start()
      Model.Log = old_log
    })
  });
});

test("update - 422 response (failed validations)", function() {
  var Post = Model("post", function() {
    this.persistence(Model.REST, "/posts-validations")
  });
  var post = Post.instance({ id: 1 });
  post.attr("title", "Foo");

  stop();

  post.save(function(success) {
    ok(!success);
    ok(this === post);
    deepEqual(this.attributes, { id: 1 }, "changes should not have been merged");
    deepEqual(this.attr(), { id: 1, title: "Foo" });
    deepEqual(this.errors.on("title"), ['should not be "Foo"', 'should be "Bar"']);
    start();
  });
});

test("update failure", function() {
  var Post = Model("post", function() {
    this.persistence(Model.REST, "/posts-failure")
  });
  var post = Post.instance({ id: 1, title: "Foo" });
  post.attr("title", "Bar");

  stop();

  post.save(function(success) {
    ok(!success);
    ok(this === post);
    deepEqual(this.attributes, { id: 1, title: "Foo" }, "changes should not have been merged");
    deepEqual(this.attr(), { id: 1, title: "Bar" });
    start();
  });
});

test("destroy", function() {
  var Post = Model("post", function() {
    this.persistence(Model.REST, "/posts")
  });
  var post = Post.instance({ id: 1, title: "Foo", body: "..." });

  AjaxSpy.start();

  stop();

  post.destroy(function(success) {
    ok(success);
    start();
  });

  equal(AjaxSpy.requests.length, 1, "one request should have been made");

  var request = AjaxSpy.requests.shift();

  equal(request.type, "DELETE");
  equal(request.url, "/posts/1");
  deepEqual(JSON.parse(request.data), { post: { title: "Foo", body: "..." } });
});

test("destroy failure", function() {
  var Post = Model("post", function() {
    this.persistence(Model.REST, "/posts-failure")
  });
  var post = Post.instance({ id: 1, title: "Foo" });

  Post.add(post);

  equal(Post.count(), 1);

  stop();

  post.destroy(function(success) {
    ok(!success);
    ok(this === post);
    equal(Post.count(), 1);
    start();
  });
});

test("destroy - 422 response (failed validations)", function() {
  var Post = Model("post", function() {
    this.persistence(Model.REST, "/posts-validations")
  });
  var post = Post.instance({ id: 1, title: "Foo" });

  stop();

  post.destroy(function(success) {
    ok(!success);
    ok(this === post);
    deepEqual(this.errors.on("title"), ["must do something else before deleting"]);
    start();
  });
});

test("events", function() {
  var Post = Model("post", function(klass, instance) {
    this.persistence(Model.REST, "/posts")

    // Stub trigger and capture its argument.
    instance.trigger = function(name) {
      events.push(name);
    }
  });

  var events = [];
  var post = Post.instance()

  stop();

  post.save(function() {
    deepEqual(events.join(", "), "create");

    post.save(function() {
      deepEqual(events.join(", "), "create, update");
      start();
    });
  });
});
