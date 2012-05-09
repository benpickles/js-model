module("Model.ClassMethods");

test("find", function() {
  var Post = Model('post');

  var post1 = new Post({ id: 1 });
  var post2 = new Post({ id: 2 });
  var post3 = new Post({ id: 3 });

  Post.collection.push(post1, post2, post3)

  ok(Post.find(1) === post1);
  ok(Post.find(2) === post2);
  ok(Post.find(3) === post3);
  ok(Post.find(4) === undefined);

  Post.collection.remove(post2)

  ok(Post.find(1) === post1);
  ok(Post.find(2) === undefined);
  ok(Post.find(3) === post3);
  ok(Post.find(4) === undefined);
});

test("load", function() {
  var TestPersistence = {
    read: function(callback) {
      callback([
        new Post({ a: 1 }),
        new Post({ b: 2 })
      ])
    }
  }

  var Post = Model("post", function() {
    this.persistence = TestPersistence
  })

  equal(Post.collection.length, 0)

  Post.load(function(models) {
    equal(Post.collection.length, 2, "should add models to collection")
    equal(models.length, 2, "should pass loaded models to callback")
  })

  ok(Post.load() === Post, "shouldn't fail if there's no callback (and return self)")
})
