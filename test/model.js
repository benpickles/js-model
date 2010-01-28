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

test("attr and changes", function() {
  var Post = Model("post");
  var post = new Post({ title: "Foo", body: "..." });

  // Set attribute using attr.
  equal(post.attr("title", "Bar"), post, "returns self");

  // Check attributes and changes.
  equals(post.attr("title"), "Bar");
  same(post.attributes, { title: "Foo", body: "..." }, "attributes should be unchanged");
  same(post.changes, { title: "Bar" });

  equal(post.reset(), post, "returns self");

  equals(post.attr("title"), "Foo");
  same(post.changes, {});

  // Set again
  post.attr("title", "Bar");

  same(post.attributes, { title: "Foo", body: "..." });
  same(post.changes, { title: "Bar" });

  ok(post.save());

  same(post.attributes, { title: "Bar", body: "..." });
  same(post.changes, {});

  equal(post.attr({ title: "Foo", bar: "Bar" }), post, "returns self");

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

test("events", function() {
  var Post = Model("post");
  var state;

  $(document).bind("post:initialize", function() {
    state = "initialized";
  });
  $(document).bind("post:create", function() {
    state = "created";
  });
  $(document).bind("post:update", function() {
    state = "updated";
  });
  $(document).bind("post:custom", function() {
    state = "custom";
  });
  $(document).bind("post:destroy", function() {
    state = "destroyed";
  });

  var post = new Post({ title: "Foo", body: "..." });
  equals(state, "initialized");

  post.save();
  equals(state, "created");

  post.attributes.id = 1;
  post.save();
  equals(state, "updated");

  post.trigger("custom");
  equals(state, "custom");

  post.destroy();
  equals(state, "destroyed");
});
