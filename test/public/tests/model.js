module("Model");

test("attr, attributes, changes, reset, save, destroy", function() {
  var Post = Model("post");

  same(new Post().attributes, {});

  var post = new Post({ title: "Foo", body: "..." });

  same(post.attributes, { title: "Foo", body: "..." });
  same(post.changes, {});

  var attr = post.attr();
  same(attr, { title: "Foo", body: "..." });
  attr.title = "Bar";
  equals(post.attributes.title, "Foo", "`attr` should return a copy of attributes not the real thing");

  post.attr("title", null);
  equals(post.attributes.title, "Foo", "attributes should be unchanged");
  equals(post.changes.title, null);
  equals(post.attr("title"), null, "null value should be read back as null");

  post.attr("title", "Foo");
  equals(post.attributes.title, "Foo");
  ok(!("title" in post.changes), "unchanged value shouldn't appear in changes");
  equals(post.attr("title"), "Foo");

  post.reset();
  same(post.attributes, { title: "Foo", body: "..." });
  same(post.changes, {});
  same(post.attr(), { title: "Foo", body: "..." });

  // Set attribute using attr.
  equals(post.attr("title", "Bar"), post, "returns self");

  // Check attributes and changes.
  equals(post.attr("title"), "Bar");
  same(post.attributes, { title: "Foo", body: "..." }, "attributes should be unchanged");
  same(post.changes, { title: "Bar" });
  same(post.attr(), { title: "Bar", body: "..." });

  equals(post.reset(), post, "returns self");

  equals(post.attr("title"), "Foo");
  same(post.changes, {});

  // Set again
  post.attr("title", "Bar");

  same(post.attributes, { title: "Foo", body: "..." });
  same(post.changes, { title: "Bar" });

  same(post.save(), post);

  same(post.attributes, { title: "Bar", body: "..." });
  same(post.changes, {});

  equals(post.attr({ title: "Foo", bar: "Bar" }), post, "returns self");

  same(post.attributes, { title: "Bar", body: "..." });
  same(post.changes, { title: "Foo", bar: "Bar" });

  same(post.save(function(success) {
    ok(success);
  }), post);

  same(post.attributes, { bar: "Bar", body: "...", title: "Foo" });
  same(post.changes, {});

  post.destroy(function(success) {
    ok(success);
  });
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

test("valid, validate, errors", function() {
  var Post = Model("post", {
    validate: function() {
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
  equals(post.errors.size(), 2);
  same(post.errors.on("body"), ["can't be blank"]);
  same(post.errors.on("title"), ["should be Bar"]);

  post.save(function(success) {
    ok(!success);
  });

  post.attr("title", "Foo");

  ok(!post.valid());
  equals(post.errors.size(), 3);
  same(post.errors.on("body"), ["can't be blank"]);
  same(post.errors.on("title"), ["should not be Foo", "should be Bar"]);

  post.reset();

  equals(post.errors.size(), 0);
  same(post.errors.on("body"), []);
  same(post.errors.on("title"), []);

  post.attr({
    body: "...",
    title: "Bar"
  });

  ok(post.valid());
  equals(post.errors.size(), 0);
  same(post.errors.on("body"), []);
  same(post.errors.on("title"), []);

  post.save(function(success) {
    ok(success);
  });

  same(post.changes, {});
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
  }).bind("custom", function(data1, data2, data3) {
    results.push(this);
    results.push("custom");
    results.push(data1);
    results.push(data2);
    results.push(data3);
  }).bind("custom", function(data1, data2, data3) {
    results.push(this);
    results.push("custom-2");
    results.push(data1);
    results.push(data2);
    results.push(data3);
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
  post.trigger("custom", [1, 2]);
  post.destroy();

  same(results, [
    post, "create",
    post, "update",
    post, "custom", 1, 2, undefined,
    post, "custom-2", 1, 2, undefined,
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
