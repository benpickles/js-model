module("Model.Collection");

test("Model.Collection", function() {
  var Post = Model('post');
  var PostCollection = Model.Collection();

  var post1 = new Post({ id: 1 });
  var post2 = new Post({ id: 2 });
  var post3 = new Post({ id: 3 });

  same(PostCollection.all(), []);
  equals(PostCollection.find(1), null);
  equals(PostCollection.first(), null);

  PostCollection.add(post1).add(post2).add(post3);

  same(PostCollection.all(), [post1, post2, post3]);
  equal(PostCollection.find(1), post1);
  equal(PostCollection.find(2), post2);
  equal(PostCollection.find(3), post3);
  equal(PostCollection.find(4), null);
  equal(PostCollection.first(), post1);

  ok(PostCollection.remove(2));

  same(PostCollection.all(), [post1, post3]);
  equal(PostCollection.find(1), post1);
  equal(PostCollection.find(2), null);
  equal(PostCollection.find(3), post3);
  equal(PostCollection.find(4), null);

  ok(!PostCollection.remove(null));
});

test("detect, select", function() {
  var Post = Model('post');
  var PostCollection = Model.Collection();

  var post1 = new Post({ id: 1, title: "Foo" });
  var post2 = new Post({ id: 2, title: "Bar" });
  var post3 = new Post({ id: 3, title: "Bar" });

  PostCollection.add(post1).add(post2).add(post3);

  equal(PostCollection.detect(function(model) {
    return model.attr("title") == "Bar";
  }), post2);

  equal(PostCollection.detect(function(model) {
    return model.attr("title") == "Baz";
  }), null);

  same(PostCollection.select(function(model) {
    return model.attr("title") == "Bar";
  }), [post2, post3]);

  same(PostCollection.select(function(model) {
    return model.attr("title") == "Baz";
  }), []);
})

test("Custom methods", function() {
  var PostCollection = Model.Collection({
    foo: function() {
      return "foo";
    }
  });

  equals(PostCollection.foo(), "foo");
});
