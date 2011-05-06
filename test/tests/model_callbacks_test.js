module("Model.Callbacks");

test("class-level", function() {
  var Post = Model('post');
  var results = [];

  var post1 = Post.instance({ id: 1 });
  var post2 = Post.instance({ id: 2 });
  var post3 = Post.instance({ id: 3 });

  Post.bind("add", function(model) {
    ok(this === Post)
    results.push("add");
    results.push(model.id())
  });

  Post.bind("remove", function(model) {
    ok(this === Post)
    results.push("remove");
    results.push(model.id())
  })

  Post.bind("custom", function(model) {
    ok(this === Post)
    results.push("custom");
    results.push(model.id())
  }).bind("custom", function() {
    ok(this === Post)
    results.push("custom-2");
  })

  Post.bind("not-called", function() {
    results.push("not-called");
  });

  Post
    .add(post1)
    .add(post2)
    .add(post1)
    .add(post3)
  Post.remove(post1);
  Post.remove(666);
  Post.trigger("custom",[post1]);

  deepEqual(results, [
    "add", 1,
    "add", 2,
    "add", 3,
    "remove", 1,
    "custom", 1,
    "custom-2"
  ]);
});

test("instance-level", function() {
  var Post = Model("post");
  var models = []
  var results = [];

  var post = Post.instance({ title: "Foo", body: "..." });

  post.bind("create", function() {
    models.push(this);
    results.push("create");
  }).bind("update", function() {
    models.push(this);
    results.push("update");
  }).bind("custom", function(data1, data2, data3) {
    models.push(this);
    results.push("custom");
    results.push(data1);
    results.push(data2);
    results.push(data3);
  }).bind("custom", function(data1, data2, data3) {
    models.push(this);
    results.push("custom-2");
    results.push(data1);
    results.push(data2);
    results.push(data3);
  }).bind("destroy", function() {
    models.push(this);
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

  assertSameModels(models, [post, post, post, post, post])
  deepEqual(results, [
    "create",
    "update",
    "custom", 1, 2, undefined,
    "custom-2", 1, 2, undefined,
    "destroy"
  ]);
});

test('instance events should only trigger on a specific instance', function () {
  var Post = Model('post')

  var foo = Post.instance({title: 'foo'})
  var bar = Post.instance({title: 'bar'})

  var triggered = false

  bar.bind('some-event', function () {
    triggered = true
  })

  foo.trigger('some-event')
  ok(!triggered, "event was triggered when it shouldn't have been")

  bar.trigger('some-event')
  ok(triggered, "event wasn't triggered when it should have been")
})

test("unbind all callbacks for an event", function() {
  var Post = Model("post");
  var results = [];

  var post = Post.instance({ title: "Foo", body: "..." });

  post.bind("create", function() {
    results.push("create");
  }).bind("update", function() {
    results.push("update");
  }).bind("custom", function() {
    results.push("custom");
  }).bind("custom", function() {
    results.push("custom-2");
  }).bind("destroy", function() {
    results.push("destroy");
  });

  post.unbind("create");
  post.unbind("update");
  post.unbind("custom");
  post.unbind("destroy");

  post.save();
  post.attributes.id = 1;
  post.save();
  post.trigger("custom");
  post.destroy();

  deepEqual(results, []);
});

test("unbind a specific event callback by function", function() {
  var Post = Model("post");
  var results = [];
  var callback = function() {
    results.push("bad");
  };

  var post = Post.instance();

  post.bind("custom", callback).bind("custom", function() {
    results.push("good");
  });
  post.unbind("custom", callback);
  post.trigger("custom");

  deepEqual(results, ["good"]);
});
