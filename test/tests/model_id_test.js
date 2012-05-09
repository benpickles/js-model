module("Model.ID")

test("id() should default to attributes.id", function() {
  var Post = Model("post"),
      post = new Post({'id': 111});
  
  deepEqual(post.id(), 111);
});

test("id field should be configurable via Model.unique_key", function() {
  var Post = Model("post", function() {
    this.unique_key = '_id'
  }),
  post = new Post({'id': 111, '_id': 222});
  
  deepEqual(post.id(), 222);
});

test("it should find by configured unique_key field", function() {
  var Post = Model("post", function() {
    this.unique_key = '_id'
  }),
  post = Post.collection.add(new Post({'_id': 222}));
  
  deepEqual(Post.find(222).id(), 222);
});