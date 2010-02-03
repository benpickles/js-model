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

  PostCollection.add(post1, post2).add(post3);

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

test("detect, select, first, last (and chaining)", function() {
  var Post = Model('post');
  var PostCollection = Model.Collection();

  var post1 = new Post({ id: 1, title: "Foo" });
  var post2 = new Post({ id: 2, title: "Bar" });
  var post3 = new Post({ id: 3, title: "Bar" });

  PostCollection.add(post1, post2, post3);

  var indexes = [];

  equal(PostCollection.detect(function(i) {
    indexes.push(i);
    return this.attr("title") == "Bar";
  }), post2);

  same(indexes, [0, 1]);
  indexes = [];

  equal(PostCollection.detect(function(i) {
    indexes.push(i);
    return this.attr("title") == "Baz";
  }), null);

  same(indexes, [0, 1, 2], "should yield index correctly");
  indexes = [];

  same(PostCollection.select(function(i) {
    indexes.push(i);
    return this.attr("title") == "Bar";
  }).all(), [post2, post3]);

  same(PostCollection.select(function(i) {
    indexes.push(i);
    return this.attr("title") == "Bar";
  }).first(), post2);

  same(PostCollection.select(function(i) {
    indexes.push(i);
    return this.attr("title") == "Bar";
  }).last(), post3);

  same(PostCollection.select(function(i) {
    indexes.push(i);
    return this.attr("title") == "Baz";
  }).all(), []);

  same(indexes, [0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2],
    "should yield index correctly");
})

test("sort (and chaining)", function() {
  var Post = Model('post');
  var PostCollection = Model.Collection();

  var post1 = new Post({ title: "bcd" });
  var post2 = new Post({ title: "xyz" });
  var post3 = new Post({ title: "Acd" });
  var post4 = new Post({ title: "abc" });

  PostCollection.add(post1, post2, post3, post4);

  same(PostCollection.all(), [post1, post2, post3, post4]);

  same(PostCollection.sort(function() {
    return this.attr("title").toLowerCase();
  }).all(), [post4, post3, post1, post2]);

  same(PostCollection.select(function() {
    return this.attr("title").indexOf("c") > -1;
  }).sort(function() {
    return this.attr("title").toLowerCase();
  }).all(), [post4, post3, post1]);

  same(PostCollection.all(), [post1, post2, post3, post4],
    "original collection should be untouched");
});

test("Custom methods", function() {
  var PostCollection = Model.Collection({
    foo: function() {
      return "foo";
    }
  });

  equals(PostCollection.foo(), "foo");
});
