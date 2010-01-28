# README

Dependencies:

 * [jQuery](http://jquery.com/)
 * [Underscore](http://documentcloud.github.com/underscore/)

## Models

### `Model()`

`Model()` is a factory for creating model classes:

    var Post = Model('post')
    var post = new Post()

### Attributes

Attributes are passed when instantiating a model object and can be directly accessed through the `attributes` property.

    var post = new Post({ title: "Foo" })
    post.attributes
    // => { title: "Foo" }

#### `attr(name, [value])`

`attr` takes two forms, passing a single argument will read while a name/value pair will write the attribute value and return `this` - allowing multiple chained setter calls.

    var post = new Post({ title: "Foo" })

    // Get attribute
    post.attr("title")
    // => "Foo"

    // Set attribute
    post.attr("title", "Bar")

    // Get attribute again
    post.attr("title")
    // => "Bar"

    // Chain setters
    post.attr("title", "Baz").attr("body", "...")
    // => post

#### `changes`

Attributes set with the `attr` method are written to an intermediary object rather than directly to the `attributes` object, these will be written to `attributes` at a later stage.

    var post = new Post({ title: "Foo" })
    post.attributes             // => { title: "Foo" }
    post.changes                // => {}

    // Change title
    post.attr("title", "Bar")
    post.attributes             // => { title: "Foo" }
    post.changes                // => { title: "Bar" }
    post.attr("title")          // => "Bar"

    // Change it back to what it was
    post.attr("title", "Foo")
    post.attributes             // => { title: "Foo" }
    post.changes                // => {}

    // Change title again and reset changes
    post.attr("title", "Bar")
    post.attributes             // => { title: "Foo" }
    post.changes                // => { title: "Bar" }
    post.reset()
    post.changes                // => {}

### Custom Methods

Custom methods can be defined on the model at class creation time, they are added to the model's `prototype` overwriting the defaults if necessary.

    var Post = Model('post', {
      foo: function() {
        ...
      }
    })

    var post = new Post({ ... })
    post.foo()
    // => Do something

Of course you can also set methods on the model's `prototype` as usual:

    Post.prototype.bar = function() {
      ...
    }
    post.bar()
    // => Do something else

### Validations

To add your own validations you should define a custom `validate` method that adds error messages to the `errors` array. `valid()` runs this method and checks that the `errors` array is empty.

    var Post = Model('post', {
      validate: function() {
        // Reset errors
        this.errors = []

        if (this.attr("title") != "Bar") {
          this.errors.push("Title should be Bar")
        }
      }
    })

    var post = new Post({ title: "Foo" })
    post.valid()
    // => false

    post.errors
    // => ["Title should be Bar"]

    post.attr("title", "Bar")
    post.valid()
    // => true

    post.errors
    // => []

### `save()`

If the model is valid `save` will merge any `changes` with `attributes`.

    var post = new Post({ title: "Foo" })

    // Post requires title to be "Bar" - see above
    post.save()                 // => false

    // Make the model valid and save
    post.attr("title", "Bar")
    post.attributes             // => { title: "Foo" }
    post.changes                // => { title: "Bar" }
    post.save()                 // => true

    post.attributes             // => { title: "Bar" }
    post.changes                // => {}

### Persistence

It's easy to persist a model's data to the server by defining an adapter when creating the class - a simple REST adapter is provided.

    var Post = Model("post", {
      persistence: ModelRestAdapter("/posts")
    })

    var post = new Post({ title: "Foo" })
    post.newRecord()  // => true

    post.save()
    // Ajax POST request made to /posts

    // The model's newly assigned id is extracted from the Ajax response
    post.id()         // => 1
    post.newRecord()  // => false

    post.attr("title", "Bar").save()
    // Ajax PUT request made to /posts/1

### Events

Through its lifetime a model will trigger some events for you to bind to:

 * `model_name:initialize`
 * `model_name:create`
 * `model_name:update`
 * `model_name:destroy`

Custom events can also be triggered by calling `trigger()`:

    post.trigger("foo")
    // => "post:foo" event triggered
