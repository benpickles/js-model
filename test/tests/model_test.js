module("Model");

test("defining attributes when instanciating a model", function() {
  var Post = Model("post")
  var post

  post = new Post(undefined)
  deepEqual({}, post.attributes)

  var attributes = { a: "a", b: "b" }
  post = new Post(attributes)
  attributes.a = "b"
  deepEqual("a", post.attributes.a)
})

test("attr, attributes, changes, reset, save, destroy", function() {
  var Post = Model("post");
  var post = new Post({ title: "Foo", body: "..." });

  deepEqual(post.attributes, { title: "Foo", body: "..." });
  deepEqual(post.changes, {});

  var attr = post.attr();
  deepEqual(attr, { title: "Foo", body: "..." });
  attr.title = "Bar";
  equal(post.attributes.title, "Foo", "`attr` should return a copy of attributes not the real thing");

  post.attr("title", null);
  equal(post.attributes.title, "Foo", "attributes should be unchanged");
  equal(post.changes.title, null);
  equal(post.attr("title"), null, "null value should be read back as null");

  post.attr("title", "Foo");
  equal(post.attributes.title, "Foo");
  ok(!("title" in post.changes), "unchanged value shouldn't appear in changes");
  equal(post.attr("title"), "Foo");

  post.reset();
  deepEqual(post.attributes, { title: "Foo", body: "..." });
  deepEqual(post.changes, {});
  deepEqual(post.attr(), { title: "Foo", body: "..." });

  // Set attribute using attr.
  ok(post.attr("title", "Bar") === post, "returns self");

  // Check attributes and changes.
  equal(post.attr("title"), "Bar");
  deepEqual(post.attributes, { title: "Foo", body: "..." }, "attributes should be unchanged");
  deepEqual(post.changes, { title: "Bar" });
  deepEqual(post.attr(), { title: "Bar", body: "..." });

  ok(post.reset() === post, "returns self");

  equal(post.attr("title"), "Foo");
  deepEqual(post.changes, {});

  // Set again
  post.attr("title", "Bar");

  deepEqual(post.attributes, { title: "Foo", body: "..." });
  deepEqual(post.changes, { title: "Bar" });

  ok(post.save() === post);

  deepEqual(post.attributes, { title: "Bar", body: "..." });
  deepEqual(post.changes, {});

  ok(post.attr({ title: "Foo", bar: "Bar" }) === post, "returns self");

  deepEqual(post.attributes, { title: "Bar", body: "..." });
  deepEqual(post.changes, { title: "Foo", bar: "Bar" });

  ok(post.save(function(success) {
    ok(success);
  }) === post);

  deepEqual(post.attributes, { bar: "Bar", body: "...", title: "Foo" });
  deepEqual(post.changes, {});

  post.destroy(function(success) {
    ok(success);
  });
});

test("custom methods", function() {
  var Post = Model("post", function(klass, proto) {
    this.foo = function() { return "foo" }
    klass.bar = function() { return "bar" }
    proto.foo = function() { return "foo" }
    this.prototype.bar = function() { return "bar" }
  })

  equal(Post.foo(), "foo");
  equal(Post.bar(), "bar");

  var post = new Post();

  equal(post.foo(), "foo");
  equal(post.bar(), "bar");
});

test("valid, validate, errors", function() {
  var Post = Model("post", function() {
    this.prototype.validate = function() {
      if (!/\S/.test(this.attr("body") || ""))
        this.errors.add("body", "can't be blank");

      if (this.attr("title") == "Foo")
        this.errors.add("title", "should not be Foo");
      if (this.attr("title") != "Bar")
        this.errors.add("title", "should be Bar");
    }
  });

  var post = new Post();

  ok(!post.valid());
  equal(post.errors.size(), 2);
  deepEqual(post.errors.on("body"), ["can't be blank"]);
  deepEqual(post.errors.on("title"), ["should be Bar"]);

  post.save(function(success) {
    ok(!success);
  });

  post.attr("title", "Foo");

  ok(!post.valid());
  equal(post.errors.size(), 3);
  deepEqual(post.errors.on("body"), ["can't be blank"]);
  deepEqual(post.errors.on("title"), ["should not be Foo", "should be Bar"]);

  post.reset();

  equal(post.errors.size(), 0);
  deepEqual(post.errors.on("body"), []);
  deepEqual(post.errors.on("title"), []);

  post.attr({
    body: "...",
    title: "Bar"
  });

  ok(post.valid());
  equal(post.errors.size(), 0);
  deepEqual(post.errors.on("body"), []);
  deepEqual(post.errors.on("title"), []);

  post.save(function(success) {
    ok(success);
  });

  deepEqual(post.changes, {});
});

test('model collection "class" methods', function() {
  var Post = Model("post");

  ok(Post.first() === undefined, "collection starts empty");

  var post = new Post();
  ok(Post.first() === undefined, "collection is unaffected");

  post.save();
  ok(Post.first() === post, "post added to collection automatically");

  post.destroy();
  ok(Post.first() === undefined, "post removed from collection automatically");
});

test("persistence", function() {
  var results = [];
  var post;

  var TestPersistence = function() {
    return {
      create: function(model, callback) {
        ok(model === post)
        results.push("create");
        results.push(callback());
      },

      destroy: function(model, callback) {
        ok(model === post)
        results.push("destroy");
        results.push(callback());
      },

      update: function(model, callback) {
        ok(model === post)
        results.push("update");
        results.push(callback());
      }
    }
  };

  var Post = Model("post", function() {
    this.persistence(TestPersistence)
  });

  var callback = function() {
    return "callback";
  };

  post = new Post();
  post.save(callback);
  post.attributes.id = 1;
  post.save(callback);
  post.destroy(callback);

  deepEqual(results, [
    "create", "callback",
    "update", "callback",
    "destroy", "callback"
  ]);
});

test("persistence failure", function() {
  var TestPersistence = function() {
    return {
      create: function(model, callback) {
        callback(false);
      },

      destroy: function(model, callback) {
        callback(false);
      },

      update: function(model, callback) {
        callback(false);
      }
    }
  };

  var Post = Model("post", function() {
    this.persistence(TestPersistence)
  });

  var events = [];

  // Stub trigger and capture its argument.
  Post.prototype.trigger = function(name) {
    events.push(name);
  };

  post = new Post();
  post.save();

  deepEqual(events, [], "should not trigger create event if persistence failed");
  deepEqual(Post.all(), [], "post should not be added to collection");

  post.attributes.id = 1;
  post.save();

  deepEqual(events, [], "should not trigger update event if persistence failed");

  post.destroy();

  deepEqual(events, [], "should not trigger destroy event if persistence failed");
});

test("#initialize", function() {
  var Post = Model("post", function() {
    this.prototype.initialize = function() {
      this.initialized = true
    }
  })

  var post = new Post()

  ok(post.initialized)
})

test("saving a model with an id should add it to the collection if it isn't already present", function() {
  var Post = Model("post")
  var post = new Post({ id: 1 }).save()

  ok(Post.first() === post)
})
