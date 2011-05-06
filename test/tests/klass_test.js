module("Model.Klass")

test("all, count, find, first, add, remove", function() {
  var Post = Model('post');

  var post1 = Post.instance({ id: 1 });
  var post2 = Post.instance({ id: 2 });
  var post3 = Post.instance({ id: 3 });

  deepEqual(Post.all(), []);
  equal(Post.count(), 0);
  ok(Post.find(1) === undefined);
  ok(Post.first() === undefined);
  ok(Post.last() === undefined);

  Post.add(post1).add(post2).add(post3)

  deepEqual(Post.pluck("id"), [1, 2, 3]);
  equal(Post.count(), 3);
  ok(Post.find(1) === post1);
  ok(Post.find(2) === post2);
  ok(Post.find(3) === post3);
  ok(Post.find(4) === undefined);
  ok(Post.first() === post1);

  ok(Post.remove(post2));

  deepEqual(Post.pluck("id"), [1, 3]);
  equal(Post.count(), 2);
  ok(Post.find(1) === post1);
  ok(Post.find(2) === undefined);
  ok(Post.find(3) === post3);
  ok(Post.find(4) === undefined);

  ok(!Post.remove(undefined));
});

test("detect, select, first, last, count (with chaining)", function() {
  var Post = Model('post');

  var post1 = Post.instance({ id: 1, title: "Foo" });
  var post2 = Post.instance({ id: 2, title: "Bar" });
  var post3 = Post.instance({ id: 3, title: "Bar" });

  Post.add(post1).add(post2).add(post3)

  var models = []
  var indexes = [];

  ok(Post.detect(function(model, i) {
    models.push(model);
    indexes.push(i);
    return model.attr("title") == "Bar";
  }) === post2);

  assertSameModels(models, [post1, post2])
  deepEqual(indexes, [0, 1]);

  models = []
  indexes = [];

  ok(Post.detect(function(model, i) {
    models.push(model);
    indexes.push(i);
    return this.attr("title") == "Baz";
  }) === undefined);

  assertSameModels(models, [post1, post2, post3])
  deepEqual(indexes, [0, 1, 2], "should yield index correctly");

  models = []
  indexes = [];

  assertSameModels(Post.select(function(model, i) {
    models.push(model);
    indexes.push(i);
    return this.attr("title") == "Bar";
  }).all(), [post2, post3]);

  ok(Post.select(function(model, i) {
    models.push(model);
    indexes.push(i);
    return this.attr("title") == "Bar";
  }).first() === post2);

  ok(Post.select(function(model, i) {
    models.push(model);
    indexes.push(i);
    return this.attr("title") == "Bar";
  }).last() === post3);

  assertSameModels(Post.select(function(model, i) {
    models.push(model);
    indexes.push(i);
    return this.attr("title") == "Baz";
  }).all(), []);

  assertSameModels(models, [post1, post2, post3, post1, post2, post3, post1, post2, post3,
    post1, post2, post3])
  deepEqual(indexes, [0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2],
    "should yield index correctly");

  deepEqual(Post.select(function(model, i) {
    return this.attr("title") == "Foo";
  }).count(), 1);

  deepEqual(Post.select(function(model, i) {
    return this.attr("title") == "Bar";
  }).count(), 2);

  deepEqual(Post.select(function(model, i) {
    return this.attr("title") == "Baz";
  }).count(), 0);

  assertSameModels(Post.select(function(model, i, all) {
    assertSameModels(all, [post1, post2, post3])
    return this.id() > 1
  }).select(function(model, i, all) {
    assertSameModels(all, [post2, post3])
    return this.id() < 3
  }).all(), [post2])

  var obj = {}

  Post.select(function() {
    ok(this === obj)
  }, obj)
})

test("each (and chaining)", function() {
  var Post = Model('post');

  var post1 = Post.instance({ id: 1, title: "Foo" });
  var post2 = Post.instance({ id: 2, title: "Bar" });
  var post3 = Post.instance({ id: 3, title: "Baz" });

  Post.add(post1).add(post2).add(post3)

  var indexes = [];
  var ids = [];
  var titles = [];

  Post.each(function(model, i, all) {
    assertSameModels(all, [post1, post2, post3])
    indexes.push(i);
    ids.push(this.id());
    titles.push(model.attr("title"));
  })

  deepEqual(indexes, [0, 1, 2]);
  deepEqual(ids, [1, 2, 3]);
  deepEqual(titles, ["Foo", "Bar", "Baz"]);

  indexes = [];
  ids = [];
  titles = [];

  Post.select(function() {
    return this.attr("title").indexOf("a") > -1;
  }).each(function(model, i, all) {
    assertSameModels(all, [post2, post3])
    indexes.push(i);
    ids.push(this.id());
    titles.push(model.attr("title"));
  })

  deepEqual(indexes, [0, 1]);
  deepEqual(ids, [2, 3]);
  deepEqual(titles, ["Bar", "Baz"]);

  var obj = {}

  Post.each(function() {
    ok(this === obj)
  }, obj)
});

test("collection should be protected from accidental modification", function() {
  var Post = Model('post')

  var post1 = Post.instance({ category_id: 2 })
  var post2 = Post.instance({ category_id: 1 })
  var post3 = Post.instance({ category_id: 2 })
  var post4 = Post.instance({ category_id: 1 })
  var post5 = Post.instance({ category_id: 2 })

  Post.collection = [post1, post2, post3, post4, post5]

  var all = Post.all()
  all.shift()

  equal(5, Post.count(), "value from all() should be safe to manipulate")

  Post.each(function() {
    Post.remove(this)
  })

  equal(Post.count(), 0)

  Post.collection = [post1, post2, post3, post4, post5]

  Post.select(function(model, i) {
    return model.attr("category_id") == 2
  }).each(function() {
    Post.remove(this)
  })

  equal(Post.count(), 2)
})

test(".pluck", function() {
  var Post = Model('post')

  var post1 = Post.instance({ id: 1, title: "a" })
  var post2 = Post.instance({ id: 2, title: "b" })
  var post3 = Post.instance({ id: 3, title: "c" })
  var post4 = Post.instance({ id: 4, title: "d" })

  Post.add(post1).add(post2).add(post3).add(post4)

  deepEqual(Post.pluck("id"), [1, 2, 3, 4])
  deepEqual(Post.pluck("title"), ["a", "b", "c", "d"])
})

test("sort (and chaining)", function() {
  var Post = Model('post');

  var post1 = Post.instance({ number: 4, title: "bcd" });
  var post2 = Post.instance({ number: 3, title: "xyz" });
  var post3 = Post.instance({ number: 2, title: "Acd" });
  var post4 = Post.instance({ number: 1, title: "abc" });

  Post.add(post1).add(post2).add(post3).add(post4)

  deepEqual(Post.pluck("title"), ["bcd", "xyz", "Acd", "abc"])

  deepEqual(Post.sortBy("title").pluck("title"), ["Acd", "abc", "bcd", "xyz"])

  deepEqual(Post.select(function() {
    return this.attr("title").indexOf("c") > -1;
  }).sortBy(function() {
    return this.attr("title").toLowerCase()
  }).pluck("title"), ["abc", "Acd", "bcd"])

  deepEqual(Post.sort(function(a, b) {
    return a.attr("number") - b.attr("number")
  }).pluck("title"), ["abc", "Acd", "xyz", "bcd"])

  deepEqual(Post.pluck("title"), ["bcd", "xyz", "Acd", "abc"],
    "original collection should be untouched");
});

test("Custom `all` method", function() {
  var Post = Model('post', function() {
    this.all = function() {
      var not_deleted = []
      var i, model
      for (i = 0; i < this.collection.length; i++) {
        model = this.collection[i]
        if (!model.attr("deleted")) not_deleted.push(model)
      }
      return not_deleted
    }
  });
  var post1 = Post.instance({ id: 1, deleted: false })
  var post2 = Post.instance({ id: 2, deleted: true })
  var post3 = Post.instance({ id: 3, deleted: false })

  Post.add(post1).add(post2).add(post3)

  var results = [];

  Post.each(function() {
    results.push(this.id());
  });

  deepEqual(results, [1,3], "`each` should iterate over `all`");
});

test("Custom method with chaining, then more chaining", function() {
  var Post = Model("post", function(klass) {
    klass.not_first = function() {
      return this.chain(this.all().slice(1));
    },

    klass.not_last = function() {
      return this.chain(this.all().slice(0, this.collection.length - 1));
    }
  });
  var post1 = Post.instance({ id: 1 });
  var post2 = Post.instance({ id: 2 });
  var post3 = Post.instance({ id: 3 });
  var post4 = Post.instance({ id: 4 });

  Post.add(post1).add(post2).add(post3).add(post4)

  ok(Post.not_first().first() === post2);
  ok(Post.not_last().last() === post3);
  ok(Post.not_first().not_last().last() === post3,
    "custom methods should be available after chaining");
});

test("load", function() {
  var TestPersistence = function() {
    return {
      read: function(callback) {
        callback([
          Post.instance({ a: 1 }),
          Post.instance({ b: 2 })
        ])
      }
    }
  }

  var Post = Model("post", function() {
    this.persistence(TestPersistence)
  })

  equal(Post.count(), 0)

  Post.load(function(models) {
    equal(Post.count(), 2, "should add models to collection")
    equal(models.length, 2, "should pass loaded models to callback")
  })

  ok(Post.load() === Post, "shouldn't fail if there's no callback (and return self)")
})

test("reverse", function() {
  var Post = Model("post")
  var post1 = Post.instance()
  var post2 = Post.instance()

  Post.add(post1).add(post2)

  assertSameModels(Post.reverse().all(), [post2, post1])
})

test("map", function() {
  var Post = Model("post")
  var post1 = Post.instance({ id: 1, title: "egg" })
  var post2 = Post.instance({ id: 2, title: "ham" })
  var post3 = Post.instance({ id: 3, title: "cheese" })

  Post.add(post1).add(post2).add(post3)

  var mapped = Post.map(function(model, i, all) {
    assertSameModels(all, [post1, post2, post3])
    return [model.id(), i, this.attr("title").toUpperCase()].join("-")
  })

  deepEqual(mapped, [
    "1-0-EGG",
    "2-1-HAM",
    "3-2-CHEESE"
  ])

  var obj = {}

  Post.map(function() {
    ok(this === obj)
  }, obj)
})

test("extend", function() {
  var A = Model("A")
  var B = Model("B")
  var module = {
    greet: function() { return "Hi " + this._name }
  }
  A.extend(module)
  B.extend(module)

  equal(A.greet(), "Hi A")
  equal(B.greet(), "Hi B")
})

test("include", function() {
  var A = Model("A")
  var B = Model("B")
  var module = {
    greet: function() { return "Hi " + this.attr("name") }
  }
  A.include(module)
  B.include(module)

  equal(A.instance({ name: "a" }).greet(), "Hi a")
  equal(B.instance({ name: "b" }).greet(), "Hi b")
})
