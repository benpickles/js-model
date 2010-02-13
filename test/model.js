module("Model");

test("attributes", function() {
  var Post = Model("post");
  var post;

  post = new Post();
  same(post.attributes, {});

  post = new Post({ title: "Foo", body: "..." });
  same(post.attributes, { title: "Foo", body: "..." });

  equals(post.attr("title"), "Foo");
});

test("attr, attributes, changes, reset, save", function() {
  var Post = Model("post");
  var post = new Post({ title: "Foo", body: "..." });

  // Setting an attribute to null should be read back as null.
  post.attr("title", null);
  equals(post.attributes.title, "Foo", "attributes should be unchanged");
  equals(post.changes.title, null);
  equals(post.attr("title"), null);

  post.attr("title", "Foo");
  equals(post.attributes.title, "Foo");
  ok(!("title" in post.changes));
  equals(post.attr("title"), "Foo");

  post.reset();
  same(post.attributes, { title: "Foo", body: "..." });
  same(post.changes, {});

  // Set attribute using attr.
  equals(post.attr("title", "Bar"), post, "returns self");

  // Check attributes and changes.
  equals(post.attr("title"), "Bar");
  same(post.attributes, { title: "Foo", body: "..." }, "attributes should be unchanged");
  same(post.changes, { title: "Bar" });

  equals(post.reset(), post, "returns self");

  equals(post.attr("title"), "Foo");
  same(post.changes, {});

  // Set again
  post.attr("title", "Bar");

  same(post.attributes, { title: "Foo", body: "..." });
  same(post.changes, { title: "Bar" });

  ok(post.save());

  same(post.attributes, { title: "Bar", body: "..." });
  same(post.changes, {});

  equals(post.attr({ title: "Foo", bar: "Bar" }), post, "returns self");

  same(post.attributes, { title: "Bar", body: "..." });
  same(post.changes, { title: "Foo", bar: "Bar" });

  ok(post.save());

  same(post.attributes, { bar: "Bar", body: "...", title: "Foo" });
  same(post.changes, {});
});

test("custom methods", function() {
  var Post = Model("post", {
    foo: function() {
      return "foo";
    }
  });

  var post = new Post();

  equals(post.foo(), "foo");
});

test("validations/save", function() {
  var Post = Model("post", {
    validate: function() {
      this.errors = [];
      if (this.attr("title") != "Bar") {
        this.errors.push("Title should be Bar");
      };
    }
  });

  var post = new Post({ title: "Foo" });

  ok(!post.valid());
  ok(!post.save());

  post.attr("title", "Bar");

  ok(post.valid());
  ok(post.save());
  same(post.changes, {});
});

test("save and destroy with callbacks", function() {
  var Post = Model("post");

  var results = [];
  var callback = function(success) {
    // `this` refers to the model itself.
    results.push(this);
    // success will always be true when no persistence adapter is defined.
    results.push(success);
  };

  var post = new Post();
  post.save(callback);
  post.attributes.id = 1;
  post.save(callback);
  post.destroy(callback);

  same(results, [
    post, true,
    post, true,
    post, true
  ]);
});

test("events", function() {
  var Post = Model("post");
  var results = [];

  var post = new Post({ title: "Foo", body: "..." });

  post.bind("create", function() {
    results.push(this);
    results.push("create");
  }).bind("update", function() {
    results.push(this);
    results.push("update");
  }).bind("custom", function() {
    results.push(this);
    results.push("custom");
  }).bind("custom", function() {
    results.push(this);
    results.push("custom-2");
  }).bind("destroy", function() {
    results.push(this);
    results.push("destroy");
  });

  post.bind("not-called", function() {
    results.push("not-called");
  });

  post.save();
  post.attributes.id = 1;
  post.save();
  post.trigger("custom");
  post.destroy();

  same(results, [
    post, "create",
    post, "update",
    post, "custom",
    post, "custom-2",
    post, "destroy"
  ]);
});

test('model collection "class" methods', function() {
  var Post = Model("post");

  ok(Post.first() == null, "collection starts empty");

  var post = new Post();
  ok(Post.first() == null, "collection is unaffected");

  post.save();
  same(Post.first(), post, "post added to collection automatically");

  post.destroy();
  ok(Post.first() == null, "post removed from collection automatically");
});

test("persistence", function() {
  var results = [];
  var post;

  var TestPersistance = {
    create: function(model, callback) {
      results.push(model);
      results.push("create");
      results.push(callback());
    },

    destroy: function(model, callback) {
      results.push(model);
      results.push("destroy");
      results.push(callback());
    },

    update: function(model, callback) {
      results.push(model);
      results.push("update");
      results.push(callback());
    }
  };

  var Post = Model("post", {
    persistence: TestPersistance
  });

  var callback = function() {
    return "callback";
  };

  post = new Post();
  post.save(callback);
  post.attributes.id = 1;
  post.save(callback);
  post.destroy(callback);

  same(results, [
    post, "create", "callback",
    post, "update", "callback",
    post, "destroy", "callback"
  ]);
});

test("persistence failure", function() {
  var TestPersistance = {
    create: function(model, callback) {
      callback(false);
    },

    destroy: function(model, callback) {
      callback(false);
    },

    update: function(model, callback) {
      callback(false);
    }
  };

  var Post = Model("post", {
    persistence: TestPersistance
  });

  var events = [];

  // Stub trigger and capture its argument.
  Post.prototype.trigger = function(name) {
    events.push(name);
  };

  post = new Post();
  post.save();

  same(events, [], "should not trigger create event if persistence failed");
  same(Post.all(), [], "post should not be added to collection");

  post.attributes.id = 1;
  post.save();

  same(events, [], "should not trigger update event if persistence failed");

  post.destroy();

  same(events, [], "should not trigger destroy event if persistence failed");
});
