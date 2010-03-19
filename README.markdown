# README

Dependencies:

 * [jQuery](http://jquery.com/) (1.4.x)
 * [Underscore](http://documentcloud.github.com/underscore/) (for now)

## Getting started

The first thing to do is to create a model class using the factory 'Model()':

    var Post = Model('post')

This allows you to create instances of 'post' models, and also contains an internal collection of all 'posts' which can be used for querying.

## Manipulating objects (without persistence yet)

The next thing you need to do is create and manipulate instances of your new JS model. These actions should be fairly familiar to people who have used ActiveRecord.

### create 

    var post = new Post({foo: 'bar'}) 

### update

    post.update({foo: 'bar' })

### destroy 

    post.destroy()

Attributes are read with the attr method, which works in a similar way to JQuery on the DOM:

    post.attr('foo'); // getter
    post.attr('foo', 'bar'); // setter

The id of an object is set after persistence, and is accessible via the id() method.

### Maintaining the state of collections

Instances need to be fed back into the model's collection, so that the results are available to "finders". The 2 main methods which handle this are:

* Post.add(post)
* Post.remove(post.id())

These are called automatically after successful persistence, but can also be called manually.

## Finding objects

Since state is held in the browser, objects need to be queried from our collection in order to be manipulated and used in the UI. This is where JS-Model is different to several other solutions. It is not a REST-based proxy for the objects on your server, and doesn't rely on constant HTTP requests to gather information. Instead it look up objects in its own cache. 

Different finders are available

    Post.all() 

and 

    Post.find(id)

These are useful for iterating over the collection and finding specific objects, respectively. It is also possible to add custom finders to the collection's prototype (see below).

## Linking data objects to UI elements

JS-model allows you to listen to the lifecycle of objects, based on the events they trigger at different points.

### Collection events

It is possible to bind to an event occurring when adding an object to a collection. Eg:

    Post.bind("add", function(new_object) {
      add_object_into_ui(new_object)
    })

and

    Post.bind("remove", function(removed_object) {
      remove_object_from_ui(removed_object)
    })

### Instance events:

Parts of your application can be bound to changes which happen to a __specific__ instance:

    my_object.bind('update', function(){ my_ui_elem.text(my_object.attr('name')) })

Including when the instance is destroyed:

    my_object.bind('remove', function(){ my_ui_elem.remove() })

## Persistence 

State can be persisted in a number of ways, including local storage. However, one of the most common uses is via REST to the originating server. JS-Model comes bundled with an optional REST persistence adaptor.

### REST/Ajax persistence

Setting up persistence for a given model is handled when the class is created: 

    var Post = Model('post', {
      persistence: Model.RestPersistence("/posts")
    }

Calling __save__ or __destroy__ on an object now fires a corresponding REST Request:

    var post = new Post({foo: 'bar'}).save() // makes a POST request to '/posts'

A custom callback can be fed into the save method to execute on success or failure:

    post.save(function(success) {
      if (success) {
        alert('yey')
      } else {
        alert('boo')
      }
    })

The default triggered events (mentioned earlier) are generally only called once persistence is successful.

## Validations

It is possible to have local validations to avoid hitting your server unnecessarily.

To add your own validations you should define a custom `validate` method that adds error messages to the `errors` object. `valid()` is called on save and checks that `errors` is empty.

    var Post = Model('post', {
      validate: function() {
        if (this.attr("title") != "Bar") {
          this.errors.add("title", "should be Bar")
        }
      }
    })

    var post = new Post()
    post.attr("title", "Foo")

    post.valid()                // => false
    post.errors.size()          // => 1
    post.errors.on("title")     // => ["should be Bar"]
    post.errors.all()           // => { title: ["should be Bar"] }

    post.attr("title", "Bar")

    post.valid()                // => true
    post.errors.size()          // => 0
    post.errors.on("title")     // => []
    post.errors.all()           // => {}

## Adding custom methods

Since models are objects, there can be a need to give them custom public methods. There are parts to a JS-model which can be extended, and these are akin to instance and class methods on an ORM such as ActiveRecord.

### Instance methods

Instance methods are often used to link objects together in a way which mimics the relationships the data might have in the remote database ('has many' etc). However, they can be pretty much anything. These are defined on the model at class creation time, they are added to the model's `prototype` overwriting the defaults if necessary.

    var Post = Model('post', {
      foo: function() {
        ...
      }
    })

    Post.find(3).foo()

### Collection (Class) methods

These are defined by extending the 'collection' method of a model with an altered version of "Model.Collection", eg:

    var Post = Model('post', {
      collection: Model.Collection({
        find_by_foo: function(foo) {
          return this.detect(function() {
            return this.attr('foo') == foo;
          });
        }
      })
    }

    Post.find_by_foo('bar')


## Triggering custom events

You might also want to have custom events on objects, which are also possible:

    post.trigger('turn_blue')

Which could be linked up to a UI element.

