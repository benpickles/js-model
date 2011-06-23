## Getting started

The first thing to do is to create a model class using the factory [`Model()`](#model).

    var Project = Model("project")

This allows you to create instances of "project" models and also contains an internal collection of all "projects" which can be used for querying.

### Manipulating objects

Now you can create and manipulate instances of your new model. Attributes are read and set with the [`attr()`](#attr) method which works in a similar way to jQuery on the DOM.

    var project = new Project({ id: 1, title: "stuff" })
    project.attr("title", "nonsense")
    project.save()

### Finding objects

After calling [`save()`](#save) on a model it is added to the class's "collection" and can be retrieved again by calling [`find()`](#find) (or [`first()`](#first) as it is the first model in the collection).

    Project.find(1)
    // => project

    Project.first()
    // => project

You can retrieve all models from the collection with [`all()`](#all).

    Project.all()
    // => [project]

For more ways to query the collection check out [`detect()`](#detect) and [`select()`](#select).

### Custom properties

You might need to give your model custom methods and properties. There are two parts to a model which can be extended, and these are akin to class and instance methods on an ORM such as ActiveRecord.

#### Class properties

When [creating a model](#model) you can pass a function as the optional second argument and "[extend](#extend)" the class by adding methods to it.

    var Project = Model("project", function() {
      this.extend({
        find_by_title: function(title) {
          return this.detect(function() {
            return this.attr("title") == title
          })
        }
      })
    })

    Project.find_by_title("stuff")
    // => "stuff" project model

#### Instance properties

You can also "[include](#include)" instance methods on the model's prototype. These are often used to link objects together in a way that mimics the relationships the data might have in the remote database ("has many" etc). However, they can be pretty much anything and can overwrite the defaults.

    var Project = Model("project", function() {
      this.include({
        markAsDone: function() {
          this.attr("done", true)
        }
      })
    })

    Project.find(1).markAsDone()
    // "stuff" project marked as done

### Associations

Simple associations can be mimicked by adding a couple of instance methods. Here a `Cat` "belongs to" a `Mat` and a `Mat` "has many" `Cat`s.

    var Cat = Model("cat", function() {
      this.include({
        mat: function() {
          var mat_id = this.attr("mat_id")

          return Mat.detect(function() {
            return this.id() == mat_id
          })
        }
      })
    })

    var Mat = Model("mat", function() {
      this.include({
        cats: function() {
          var id = this.id()

          return Cat.select(function() {
            return this.attr("mat_id") == id
          })
        }
      })
    })

### Events

js-model allows you to listen to the lifecycle of objects based on the events they trigger at different points. Typically you'll use this to link your data objects to UI elements.

#### Class events

It is possible to bind to an event occurring when adding and removing an object to a collection.

    Project.bind("add", function(new_object) {
      add_object_to_ui(new_object)
    })

    Project.bind("remove", function(removed_object) {
      remove_object_from_ui(removed_object)
    })

#### Instance events

Parts of your application can be bound to changes which happen to a specific instance:

    var project = Project.first()

    project.bind("update", function() {
      my_ui_elem.text(this.attr("name"))
    })

Including when the instance is destroyed:

    project.bind("destroy", function() {
      my_ui_elem.remove()
    })

#### Custom events

You might also want to have custom events on objects which might be linked up to a UI element.

    project.bind("turn_blue", function() {
      my_ui_elem.css("background", "blue")
    })

    project.trigger("turn_blue")

### Validations

To add your own validations you should define a custom [`validate()`](#validate) method on your model that adds error messages to the [`errors`](#errors) object. [`valid()`](#valid) is called on [`save()`](#save) and checks that there are no errors. Validations are useful when using [localStorage persistence](#localstorage) but can also help you avoid hitting your server unnecessarily if you're using [REST persistence](#rest).
