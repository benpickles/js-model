### Static properties

When you factory a new model using [`Model()`](#model) the returned constructor includes the following static properties.

#### `find(id)`

Convenience method to return the model with the corresponding id.

    Food.find(2)
    // => ham

    Food.find(69)
    // => undefined

#### `load(callback)`

Calls [`read()`](#read) on the persistence adapter and adds the returned models to the collection. The supplied callback is then passed an array of the newly added models.

    Food.load(function(models) {
      // do something...
    })

#### `new(attributes)`

Instantiates a model, the supplied attributes get assigned directly to the model's [`attributes`](#attributes). Custom initialization behaviour can be added by defining an [`initialize()`](#initialize) instance method.

    var fish = new Food({ name: "fish" })

    fish.attributes
    // => { name: "fish" }

    fish.changes
    // => {}

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
