### Class properties

#### `add(model)`

Adds a model to a collection and is what [`save()`](#save) calls internally if it is successful. `add()` won't allow you to add a model to the collection if one already exists with the same [`id`](#id) or [`uid`](#uid).

    Food.all()
    // => []

    var egg = new Food({ id: 1, name: "egg" })
    var ham = new Food({ id: 2, name: "ham" })
    var cheese = new Food({ id: 3, name: "cheese" })

    Food.add(egg)
    Food.all()
    // => [egg]

    Food.add(ham).add(cheese)
    Food.all()
    // => [egg, ham, cheese]

    var not_egg = new Food({ id: 1, name: "not egg" })

    Food.add(not_egg)
    Food.all()
    // => [egg, ham, cheese]

#### `all()`

Returns an array of the models contained in the collection.

    Food.all()
    // => [egg, ham, cheese]

    Food.select(function() {
      return this.attr("name").indexOf("e") > -1
    }).all()
    // => [egg, cheese]

#### `chain(arrayOfModels)`

A utility method to enable chaining methods on a collection -- used internally by [`select()`](#select) for instance.

#### `count()`

Returns the size of the collection.

    Food.count()
    // => 3

    Food.select(function() {
      return this.attr("name").indexOf("e") > -1
    }).count()
    // => 2

#### `detect(func)`

Operates on the collection returning the first model that matches the supplied function.

    Food.detect(function() {
      return this.attr("name") == "ham"
    })
    // => ham

#### `each(func)`

Iterates over the collection calling the supplied function for each model.

    Food.each(function() {
      console.log(this.attr("name"))
    })
    // => logs "egg", "ham" and "cheese"

    Food.select(function() {
      return this.attr("name").indexOf("e") > -1
    }).each(function() {
      console.log(this.attr("name"))
    })
    // => logs "egg" and "cheese"

#### `extend(object)`

Add class methods.

    Food.extend({
      nameHasLetter: function(letter) {
        return this.select(function() {
          return this.attr("name").indexOf(letter) > -1
        })
      }
    })

    Food.nameHasLetter("e")
    // => [egg, cheese]

#### `find(id)`

Returns the model with the corresponding id.

    Food.find(2)
    // => ham

    Food.find(69)
    // => undefined

#### `first()`

Returns the first model in the collection.

    Food.first()
    // => egg

    Food.select(function() {
      return this.attr("name").indexOf("h") > -1
    }).first()
    // => ham

#### `include(object)`

Add methods to the class's `prototype`.

    Food.include({
      reverseName: function() {
        return this.attr("name").split("").reverse().join("")
      }
    })

    var carrot = new Food({ name: "Carrot" })
    carrot.reverseName()
    // => "torraC"

**Note:** Be careful when adding properties that aren't primitives to an object's `prototype`, this can result in unexpected behaviour as the `prototype` is shared across all instances, for example:

    var Post = Model("post")
    Post.include({
      comments: [],

      comment: function(text) {
        this.comments.push(text)
      }
    })

    var post1 = new Post({ title: "Ham" })
    var post2 = new Post({ title: "Egg" })

    post1.comments  // => []
    post2.comments  // => []

    post1.comment("Tasty")

    post1.comments  // => ["Tasty"]
    post2.comments  // => ["Tasty"]

In the above case an [initializer](#initialize) would take care of things:

    var Post = Model("post", function() {
      this.include({
        initialize: function() {
          this.comments = []
        },

        comment: function(text) {
          this.comments.push(text)
        }
      })
    })

    var post1 = new Post({ title: "Ham" })
    var post2 = new Post({ title: "Egg" })

    post1.comments  // => []
    post2.comments  // => []

    post1.comment("Tasty")

    post1.comments  // => ["Tasty"]
    post2.comments  // => []

#### `last()`

Returns the last model in the collection.

    Food.last()
    // => cheese

#### `load(callback)`

Calls [`read()`](#read) on the persistence adapter and adds the returned models to the collection. The supplied callback is then passed an array of the newly added models.

    Food.load(function(models) {
      // do something...
    })

#### `map(func)`

Operates on the collection returning an array of values by calling the specified method on each instance.

    Food.map(function() {
      return this.attr("name").toUpperCase()
    })
    // => ["EGG", "HAM", "CHEESE"]

    Food.select(function() {
      return this.attr("name").indexOf("e") > -1
    }).map(function() {
      return this.attr("name").toUpperCase()
    })
    // => ["EGG", "CHEESE"]

#### `new(attributes)`

Instantiates a model, the supplied attributes get assigned directly to the model's [`attributes`](#attributes). Custom initialization behaviour can be added by defining an [`initialize()`](#initialize) instance method.

    var fish = new Food({ name: "fish" })

    fish.attributes
    // => { name: "fish" }

    fish.changes
    // => {}

#### `persistence(adapter, ...)`

Set or get the persistence adapter for a class. The first argument is a reference to the adapter which is initialised with a reference to the class and any further arguments provided. See [persistence](#persistence) for more.

    Project.persistence(Model.REST, "/projects")

    Project.persistence()
    // => the initialised REST persistence adapter

#### `pluck(attributeName)`

Operates on the collection returning an array of values for the specified attribute.

    Food.pluck("name")
    // => ["egg", "ham", "cheese"]

    Food.select(function() {
      return this.attr("name").indexOf("e") > -1
    }).pluck("name")
    // => ["egg", "cheese"]

#### `remove(model)`

Removes a model from a collection.

    Food.all()
    // => [egg, ham, cheese]

    Food.remove(egg)
    Food.all()
    // => [ham, cheese]

#### `reverse()`

Returns a collection containing the models in reverse order.

    Food.reverse().all()
    // => [cheese, ham, egg]

#### `select(func)`

Operates on the collection returning a collection containing all models that match the supplied function.

    Food.select(function() {
      return this.attr("name").indexOf("e") > -1
    }).all()
    // => [egg, cheese]

#### `sort(func)`

Acts like `Array#sort()` on the collection. It's more likely you'll want to use [`sortBy()`](#sortby) which is a far more convenient wrapper to `sort()`.

#### `sortBy(attributeName` or `func)`

Returns the collection sorted by either an attribute or a custom function.

    Food.sortBy("name").all()
    // => [cheese, egg, ham]

    Food.sortBy(function() {
      return this.attr("name").length
    }).all()
    // => [egg, ham, cheese]

#### `unique_key`

`unique_key` refers to the attribute that holds the "primary key" and defaults to `"id"`. It's useful when using with something like MongoDB.

    Project = Model("project", function() {
      this.unique_key = "_id"
    })

    project = new Project({ _id: "qwerty" })
    project.id()
    // => "qwerty"

#### `use(Plugin, ...)`

Applies a plugin to the class.

    Project = Model("project", function() {
      this.use(MyPlugin, "with", { extra: "arguments" })
    })

`use` can also be called outside of a model's declaration as it's simply a class method.

    Project.use(MyPlugin, "with", { extra: "arguments" })
