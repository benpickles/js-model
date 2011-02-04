# js-model

Built on top of [jQuery](http://jquery.com/), js-model is a library that enables you to work with models in your JavaScript.

## In brief

Declare a model class:

    var Todo = Model("todo")

Now create and manipulate model instances:

    var todo = new Todo({ text: "do it" })
    todo.attr("when", "now")
    todo.save()

## More

    var Project = Model("project", function(klass, proto) {
      // "this" is the klass that has just been "factoried", the default
      // class/instance methods have already been applied.

      // Setup REST persistence on you class. Calling save() on an new
      // instance will now POST its data to your server.
      this.persistence(Model.REST, "/projects")

      // Define a class method.
      this.classMethod = function() { ... }

      // Or reference "klass" - it's the same thing.
      klass.anotherClassMethod = function() { ... }

      // You have normal access to prototype of course.
      this.prototype.instanceMethod = function() { ... }

      // But using "proto" is shorter.
      proto.anotherInstanceMethod = function() { ... }

      // Having a closure allows easy "private" methods.
      function calculateSomething() { ... }

      proto.publicMethod = function() {
        // ...
        calculateSomething()
        // ...
      }
    })

    // Creating a new project and persisting it to the server is as simple as:
    new Project({ name: "go fish" }).save()

## Documentation / download / more

For notes on [getting started](http://benpickles.github.com/js-model/#getting-started), [persisting via REST or localStorage](http://benpickles.github.com/js-model/#persistence), [using with Sammy](http://benpickles.github.com/js-model/#js-model-hearts-sammy), [API documentation](http://benpickles.github.com/js-model/#api) and download links visit the [js-model docs site](http://benpickles.github.com/js-model/).

## Suggestions / questions / issues / comments

Feel free to use [Github issues](http://github.com/benpickles/js-model/issues) for any of the above.

## Copyright

Copyright 2010 [Ben Pickles](http://benpickles.com/). See [LICENSE](http://github.com/benpickles/js-model/blob/master/LICENSE) for details.
