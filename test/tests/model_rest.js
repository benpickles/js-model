module("Model.REST");

asyncTest("read", 3, function() {
  var Post = Model("post", {
    persistence: Model.REST("/posts")
  })

  Post.persistence.read(function(models) {
    equals(models.length, 2)

    var post1 = models[0]
    var post2 = models[1]

    same({ id: 1, title: "Bar" }, post1.attributes)
    same({ id: 2, title: "Foo" }, post2.attributes)

    start()
  })
})

asyncTest("read", 2, function() {
  var Post = Model("post", {
    persistence: Model.REST("/posts-single")
  })

  Post.persistence.read(function(models) {
    equals(models.length, 1)
    same({ id: 1, title: "Bar" }, models[0].attributes)
    start()
  })
})

test("create with named params in resource path", function() {
  var Post = Model("post", {
    persistence: Model.REST("/root/:root_id/nested/:nested_id/posts")
  });
  var post = new Post({ title: "Nested", body: "...", root_id: 3, nested_id: 2 });

  AjaxSpy.start();
  stop();

  post.save(function(success) {
    ok(success);
    start();
  });

  equals(AjaxSpy.requests.length, 1, "one request should have been made");

  var request = AjaxSpy.requests.shift();
  
  equals(request.type, "POST");
  equals(request.url, "/root/3/nested/2/posts");
});

test("update with named params in resource path", function() {
  var Post = Model("post", {
    persistence: Model.REST("/root/:root_id/nested/:nested_id/posts")
  });
  var post = new Post({ id: 1, title: "Nested", body: "...", root_id: 3, nested_id: 2 });
  post.attr("title", "Nested amended");

  AjaxSpy.start();
  stop();

  post.save(function(success) {
    ok(success);
    start();
  });

  equals(AjaxSpy.requests.length, 1, "one request should have been made");

  var request = AjaxSpy.requests.shift();

  equals(request.type, "PUT");
  equals(request.url, "/root/3/nested/2/posts/1");
});

test("update with custom unique_key field", function() {
  var Post = Model("post", {
    unique_key: '_id',
    persistence: Model.REST("/root/:root_id/nested/:nested_id/posts")
  });
  var post = new Post({ '_id': 1, title: "Nested", body: "...", root_id: 3, nested_id: 2 });

  AjaxSpy.start();
  stop();

  post.save(function(success) {
    ok(success);
    start();
  });

  var request = AjaxSpy.requests.shift();

  same(JSON.parse(request.data), {post: {title: 'Nested', body: "...", root_id: 3, nested_id: 2}});
});


test("destroy with named params in resource path", function() {
  var Post = Model("post", {
    persistence: Model.REST("/root/:root_id/nested/:nested_id/posts")
  });
  var post = new Post({ id: 1, title: "Nested", body: "...", root_id: 3, nested_id: 2 });

  AjaxSpy.start();
  stop();

  post.destroy(function(success) {
    ok(success);
    start();
  });

  equals(AjaxSpy.requests.length, 1, "one request should have been made");

  var request = AjaxSpy.requests.shift();

  equals(request.type, "DELETE");
  equals(request.url, "/root/3/nested/2/posts/1");
  same(JSON.parse(request.data), {post: {title: 'Nested', body: "...", root_id: 3, nested_id: 2}});
});

test("create", function() {
  var Post = Model("post", {
    persistence: Model.REST("/posts")
  });
  var post = new Post({ title: "Foo", body: "..." });

  equals(Post.count(), 0);

  AjaxSpy.start();

  stop();

  post.save(function(success) {
    ok(success);
    same(this, post);
    same(post.attributes, { id: 1, title: "Foo amended", body: "...", foo: "bar" });
    equals(post.id(), 1);
    equals(Post.count(), 1);
    start();
  });

  equals(AjaxSpy.requests.length, 1, "one request should have been made");

  var request = AjaxSpy.requests.shift();

  equals(request.type, "POST");
  equals(request.url, "/posts");
  same(JSON.parse(request.data), { post: { title: "Foo", body: "..." } });
});

test("create - 422 response (failed validations)", function() {
  var Post = Model("post", {
    persistence: Model.REST("/posts-validations")
  });
  var post = new Post();
  post.attr("title", "Foo");

  stop();

  post.save(function(success) {
    ok(!success);
    same(this, post);
    same(this.attributes, {}, "changes should not have been merged");
    same(this.attr(), { title: "Foo" });
    same(this.errors.on("title"), ['should not be "Foo"', 'should be "Bar"']);
    start();
  });
});

test("create failure", function() {
  var Post = Model("post", {
    persistence: Model.REST("/posts-failure")
  });
  var post = new Post();
  post.attr({ title: "Foo", body: "..." });

  equals(Post.count(), 0);

  stop();

  post.save(function(success) {
    ok(!success);
    same(this, post);
    same(this.attributes, {}, "changes should not have been merged");
    same(this.attr(), { title: "Foo", body: "..." });
    equals(Post.count(), 0);
    start();
  });
});

test("create with AjaxSetup", function() {
  
  jQuery.ajaxSetup({
    data: {
      socket_id: '111'
    }
  })
  
  var Post = Model("post", {
    persistence: Model.REST("/posts")
  });
  var post = new Post({ title: "Foo", body: "..." });

  equals(Post.count(), 0);

  AjaxSpy.start();

  stop();

  post.save(function(success) {
    ok(success);
    same(this, post);
    start();
  });

  equals(AjaxSpy.requests.length, 1, "one request should have been made");

  var request = AjaxSpy.requests.shift();
  same(JSON.parse(request.data), { socket_id: '111', post: { title: "Foo", body: "..." } });
});

test("update", function() {
  var Post = Model("post", {
    persistence: Model.REST("/posts")
  });
  var post = new Post({ id: 1, title: "Foo", body: "..." });
  post.attr("title", "Bar");

  AjaxSpy.start();

  stop();

  post.save(function(success) {
    ok(success);
    same(this, post);
    same(post.attributes, { id: 1, title: "Bar amended", body: "..." });
    start();
  });

  equals(AjaxSpy.requests.length, 1, "one request should have been made");

  var request = AjaxSpy.requests.shift();

  equals(request.type, "PUT");
  equals(request.url, "/posts/1");
  same(JSON.parse(request.data), { post: { title: "Bar", body: "..." } });
});

test("update - blank response (Rails' `head :ok`)", function() {
  var Post = Model("post", {
    persistence: Model.REST("/posts-empty-response")
  });
  var post = new Post({ id: 1, title: "Foo", body: "..." });
  post.attr("title", "Bar");

  stop();

  var old_log = Model.Log;
  var logged = [];

  Model.Log = function() {
    logged.push(arguments);
  };

  post.save(function(success) {
    same(logged, []);

    post.destroy(function(success) {
      same(logged, [])
      start()
      Model.Log = old_log
    })
  });
});

test("update - 422 response (failed validations)", function() {
  var Post = Model("post", {
    persistence: Model.REST("/posts-validations")
  });
  var post = new Post({ id: 1 });
  post.attr("title", "Foo");

  stop();

  post.save(function(success) {
    ok(!success);
    same(this, post);
    same(this.attributes, { id: 1 }, "changes should not have been merged");
    same(this.attr(), { id: 1, title: "Foo" });
    same(this.errors.on("title"), ['should not be "Foo"', 'should be "Bar"']);
    start();
  });
});

test("update failure", function() {
  var Post = Model("post", {
    persistence: Model.REST("/posts-failure")
  });
  var post = new Post({ id: 1, title: "Foo" });
  post.attr("title", "Bar");

  stop();

  post.save(function(success) {
    ok(!success);
    same(this, post);
    same(this.attributes, { id: 1, title: "Foo" }, "changes should not have been merged");
    same(this.attr(), { id: 1, title: "Bar" });
    start();
  });
});

test("destroy", function() {
  var Post = Model("post", {
    persistence: Model.REST("/posts")
  });
  var post = new Post({ id: 1, title: "Foo", body: "..." });

  AjaxSpy.start();

  stop();

  post.destroy(function(success) {
    ok(success);
    start();
  });

  equals(AjaxSpy.requests.length, 1, "one request should have been made");

  var request = AjaxSpy.requests.shift();

  equals(request.type, "DELETE");
  equals(request.url, "/posts/1");
  same(JSON.parse(request.data), { post: { title: "Foo", body: "..." } });
});

test("destroy failure", function() {
  var Post = Model("post", {
    persistence: Model.REST("/posts-failure")
  });
  var post = new Post({ id: 1, title: "Foo" });

  Post.add(post);

  equals(Post.count(), 1);

  stop();

  post.destroy(function(success) {
    ok(!success);
    same(this, post);
    equals(Post.count(), 1);
    start();
  });
});

test("destroy - 422 response (failed validations)", function() {
  var Post = Model("post", {
    persistence: Model.REST("/posts-validations")
  });
  var post = new Post({ id: 1, title: "Foo" });

  stop();

  post.destroy(function(success) {
    ok(!success);
    same(this, post);
    same(this.errors.on("title"), ["must do something else before deleting"]);
    start();
  });
});

test("events", function() {
  var Post = Model("post", {
    persistence: Model.REST("/posts")
  });

  var events = [];

  // Stub trigger and capture its argument.
  Post.prototype.trigger = function(name) {
    events.push(name);
  };

  var post = new Post();

  stop();

  post.save(function() {
    same(events.join(", "), "create");

    post.save(function() {
      same(events.join(", "), "create, update");
      start();
    });
  });
});
