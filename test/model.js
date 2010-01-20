module("Model");

test("attributes", function() {
  var Post = Model("post");
  var post;

  post = new Post();
  same({}, post.attributes);

  post = new Post({ title: "Foo", body: "..." });
  same({ title: "Foo", body: "..." }, post.attributes);

  equals("Foo", post.attr("title"));
});

test("attr and changes", function() {
  var Post = Model("post");
  var post = new Post({ title: "Foo", body: "..." });

  // Set attribute using attr.
  post.attr("title", "Bar");

  // Check attributes and changes.
  equals("Bar", post.attr("title"));
  same({ title: "Foo", body: "..." }, post.attributes, "attributes should be unchanged");
  same({ title: "Bar" }, post.changes);

  post.clearChanges();

  equals("Foo", post.attr("title"));
  same({}, post.changes);

  // Set again
  post.attr("title", "Bar");

  same({ title: "Foo", body: "..." }, post.attributes);
  same({ title: "Bar" }, post.changes);

  post.save();

  same({ title: "Bar", body: "..." }, post.attributes);
  same({}, post.changes);
});

test("custom methods", function() {
  var Post = Model("post", {
    foo: function() {
      return "foo";
    }
  });

  var post = new Post();

  equal("foo", post.foo());
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
  same({}, post.changes);
});

test("events", function() {
  var Post = Model("post");
  var state;

  $().bind("post:changed", function() {
    state = "changed";
  });
  $().bind("post:initialize", function() {
    state = "initialized";
  });
  $().bind("post:save", function() {
    state = "saved";
  });

  var post = new Post({ title: "Foo", body: "..." });

  equal("initialized", state);

  post.save();

  equal("saved", state);

  post.changed();

  equal("changed", state);
});
