### Model

#### `attributes`

Direct access to a model's attributes object. Most of the time you won't need to use this and should use [`get()`](#get) and [`set()`](#set) instead.

    var project = new Project({ title: "Foo" })
    project.attributes
    // => { title: "Foo" }

#### `changes`

Attributes set with the [`set()`](#set) method are written to the `changes` intermediary object rather than directly to the [`attributes`](#attributes) object. This allows you to see any previous attribute values and enables validations -- see [`validate()`](#validate) for more on validations. `changes` are committed to [`attributes`](#attributes) on successful [`save()`](#save).

    var project = new Project({ title: "Foo" })
    project.attributes             // => { title: "Foo" }
    project.changes                // => {}

    // Change title
    project.set("title", "Bar")
    project.attributes             // => { title: "Foo" }
    project.changes                // => { title: "Bar" }
    project.get("title")           // => "Bar"

    // Change it back to what it was
    project.set("title", "Foo")
    project.attributes             // => { title: "Foo" }
    project.changes                // => {}

    // Change title again and reset changes
    project.set("title", "Bar")
    project.attributes             // => { title: "Foo" }
    project.changes                // => { title: "Bar" }
    project.reset()
    project.changes                // => {}

#### `destroy(callback)`

Removes the model from the collection and calls [`destroy()`](#destroy) on the persistence adapter if one is defined.

    Food.all()
    // => [egg, ham, cheese]

    ham.destroy()

    Food.all()
    // => [egg, cheese]

#### `errors`

Returns an [`Errors`](#api-errors) object containing information about any failed validations -- similar to ActiveRecord's Errors object. See [`Errors`](#api-errors) for more information. 

#### `get([name])`

Returns a model's attribute(s). Can be used to fetch either a specific attribute by passing the attribute name or all name/value attribute pairs by passing nothing.

    var project = new Project({ title: "Foo", category: "Stuff" })

    // Get attribute
    project.get("title")
    // => "Foo"

    // Get all attributes
    project.get()
    // => { title: "Foo", category: "Stuff" }

#### `id()`

Convenience method, equivalent of calling `get("id")`.

#### `initialize()`

If an `initialize()` instance method is defined on a class it is called at the end of the initialization process.

    var User = Model("user", function() {
      this.include({
        initialize: function() {
          this.set("state", "initialized")
        }
      })
    })
    var user = new User()

    user.get("state")
    // => "initialized"

#### `newRecord()`

If the model doesn't have an id then it's new. This is what js-model checks when saving to decide whether it should call [`create()`](#create) or [`update()`](#update) on the persistence adapter.

    egg = new Food({ name: "egg" })
    ham = new Food({ id: 2, name: "ham" })

    egg.newRecord()   // => true
    ham.newRecord()   // => false

#### `reset()`

Clears all [`changes`](#changes) and [`errors`](#errors).

#### `save(callback)`

`save()` encapsulates quite a bit of functionality:

 * Check whether the model is [`valid()`](#valid), if not then halt here passing the callback `false`.
 * If the model is [new](#newrecord) then call [`create()`](#create) on the persistence adapter otherwise call [`update()`](#update).
 * If the persistence call is successful then [`merge()`](#merge) any [`changes`](#changes) into [`attributes`](#attributes) and [`add()`](#add) the model to the collection if it's new.
 * Finally the supplied callback is called with a boolean to indicate success/failure and any further arguments the persistence adapter supplies.

If your persistence layer returns any data this will also be [merged](#merge) into the attributes -- this is how your server-assigned id gets assigned to the model when you use [REST persistence](#rest).

**Note:** It's important to understand that the callback passed to `save()` may take some time to be called as it may depend on a response from your server.

    Food.all()
    // => [egg, ham, cheese]

    var fish = new Food({ name: "fish" })

    fish.save(function(success) {
      if (success) {
        Food.all()
        // => [egg, ham, cheese, fish]

        fish.id()
        // => 4
      } else {
        // boo, something went wrong :(
      }
    })

#### `set(name, value | attributes)`

Set a model's attribute(s) passing either a name/value pair or an object containing multiple.

Attributes modified using `set()` can be reverted -- see [`changes`](#changes) for more information.

    var project = new Project({ title: "Foo", category: "Stuff" })

    // Set attribute
    project.set("title", "Bar")

    // Chain setters
    project
      .set("title", "Baz")
      .set("category", "Nonsense")

    // Set multiple attributes
    project.set({
      title: "Foo again",
      tags: "stuff nonsense"
    })

    // Get all attributes
    project.get()
    // => { title: "Foo again", category: "Nonsense", tags: "stuff nonsense" }

#### `toJSON()`

Hook to allow `JSON.stringify(myModel)` to work, returns a clone of the model's attributes.

#### `uid`

Automatically assigned on instantiation, this is a per-page-load-unique id -- used by the [localStorage persistence adapter](#localstorage).

#### `valid()`

Calls [`validate()`](#validate) and checks for the existence of any errors returning `true` or `false`. Used by [`save()`](#save) which won't continue if `valid()` returns `false`.

#### `validate()`

Overwrite this method to add client-side validations to your model. This method is called on [`save()`](#save) which won't continue if the [`errors`](#errors) object is not empty.

    var Project = Model("project", function() {
      this.include({
        validate: function() {
          if (this.get("title") != "Bar") {
            this.errors.add("title", "should be Bar")
          }
        }
      })
    })

    var project = new Project({ title: "Foo" })
    project.valid()
    // => false

    project.set("title", "Bar")
    project.valid()
    // => true
