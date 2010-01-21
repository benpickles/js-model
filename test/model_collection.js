module("ModelCollection");

test("ModelCollection", function() {
  var Post = Model('post');
  var PostCollection = new ModelCollection();

  var post1 = new Post({ id: 1 });
  var post2 = new Post({ id: 2 });

  same([], PostCollection.all());
  equal(null, PostCollection.find(1));
  equal(null, PostCollection.first());

  PostCollection.add(post1).add(post2);

  same([post1, post2], PostCollection.all());
  same(post1, PostCollection.find(1));
  same(post2, PostCollection.find(2));
  same(null, PostCollection.find(3));
  same(post1, PostCollection.first());
});
