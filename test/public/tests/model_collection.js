module("Model.Collection");

test("all, count, find, first, add, remove", function() {
  var Post = Model('post');
  var PostCollection = Model.Collection();

  var post1 = new Post({ id: 1 });
  var post2 = new Post({ id: 2 });
  var post3 = new Post({ id: 3 });

  same(PostCollection.all(), []);
  equals(PostCollection.count(), 0);
  equals(PostCollection.find(1), null);
  equals(PostCollection.first(), null);

  PostCollection.add(post1, post2).add(post3);

  same(PostCollection.all(), [post1, post2, post3]);
  equals(PostCollection.count(), 3);
  equals(PostCollection.find(1), post1);
  equals(PostCollection.find(2), post2);
  equals(PostCollection.find(3), post3);
  equals(PostCollection.find(4), null);
  equals(PostCollection.first(), post1);

  ok(PostCollection.remove(2));

  same(PostCollection.all(), [post1, post3]);
  equals(PostCollection.count(), 2);
  equals(PostCollection.find(1), post1);
  equals(PostCollection.find(2), null);
  equals(PostCollection.find(3), post3);
  equals(PostCollection.find(4), null);

  ok(!PostCollection.remove(null));

  var post1_duplicate = new Post({ id: 1 });
  PostCollection.add(post1_duplicate);

  same(PostCollection.all(), [post1, post3], "shouldn't be able to add if a model with the same id exists in the collection");
});

test("detect, select, first, last, count (with chaining)", function() {
  var Post = Model('post');
  var PostCollection = Model.Collection();

  var post1 = new Post({ id: 1, title: "Foo" });
  var post2 = new Post({ id: 2, title: "Bar" });
  var post3 = new Post({ id: 3, title: "Bar" });

  PostCollection.add(post1, post2, post3);

  var indexes = [];

  equals(PostCollection.detect(function(i) {
    indexes.push(i);
    return this.attr("title") == "Bar";
  }), post2);

  same(indexes, [0, 1]);
  indexes = [];

  equals(PostCollection.detect(function(i) {
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

  same(PostCollection.select(function(i) {
    return this.attr("title") == "Foo";
  }).count(), 1);

  same(PostCollection.select(function(i) {
    return this.attr("title") == "Bar";
  }).count(), 2);

  same(PostCollection.select(function(i) {
    return this.attr("title") == "Baz";
  }).count(), 0);
})

test("each (and chaining)", function() {
  var Post = Model('post');
  var PostCollection = Model.Collection();

  var post1 = new Post({ id: 1, title: "Foo" });
  var post2 = new Post({ id: 2, title: "Bar" });
  var post3 = new Post({ id: 3, title: "Baz" });

  PostCollection.add(post1, post2, post3);

  var indexes = [];
  var ids = [];
  var titles = [];

  var eachFunc = function(i) {
    indexes.push(i);
    ids.push(this.id());
    titles.push(this.attr("title"));
  };

  PostCollection.each(eachFunc);

  same(indexes, [0, 1, 2]);
  same(ids, [1, 2, 3]);
  same(titles, ["Foo", "Bar", "Baz"]);

  indexes = [];
  ids = [];
  titles = [];

  PostCollection.select(function() {
    return this.attr("title").indexOf("a") > -1;
  }).each(eachFunc);

  same(indexes, [0, 1]);
  same(ids, [2, 3]);
  same(titles, ["Bar", "Baz"]);
});

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

test("events", function() {
  var Post = Model('post');
  var results = [];

  var post1 = new Post({ id: 1 });
  var post2 = new Post({ id: 2 });
  var post3 = new Post({ id: 3 });

  Post.bind("add", function() {
    results.push(this);
    results.push("add");
    for (var i = 0; i < arguments.length; i++) {
      results.push(arguments[i]);
    };
  });

  Post.bind("remove", function() {
    results.push(this);
    results.push("remove");
  })

  Post.bind("custom", function() {
    results.push(this);
    results.push("custom");
  }).bind("custom", function() {
    results.push(this);
    results.push("custom-2");
  })

  Post.bind("not-called", function() {
    results.push("not-called");
  });

  Post.add(post1, post2);
  Post.add(post1);
  Post.add(post3);
  Post.remove(1);
  Post.remove(666);
  Post.trigger("custom");

  same(results, [
    Post, "add", post1, post2,
    Post, "add", post3,
    Post, "remove",
    Post, "custom",
    Post, "custom-2"
  ]);
});

test("Custom `all` method", function() {
  var Post = Model('post', {
    all: function() {
      return _.sortBy(this.collection, function(model) {
        return model.attr("position");
      });
    }
  });
  var post1 = new Post({ id: 1, position: 2 });
  var post2 = new Post({ id: 2, position: 3 });
  var post3 = new Post({ id: 3, position: 1 });

  Post.add(post1, post2, post3);

  var results = [];

  Post.each(function() {
    results.push(this.id());
  });

  equals(results.join(", "), "3, 1, 2", "`each` should iterate over `all`");
});
