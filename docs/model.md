### `Model(name, func)`

`Model()` is a factory method that is used to generate model classes. At its simplest it can be used like so:

    var Project = Model("project")

The optional function is used to define custom methods and properties on your newly defined class and its prototype. It is called with the scope of the class and with two arguments: the class and the prototype.

    var Project = Model("project", function(klass, proto) {
      klass.find_by_title = function(title) {
        return this.detect(function() {
          return this.attr("title") == title
        })
      }

      proto.markAsDone = function() {
        this.attr("done", true)
      }
    })

    Project.find_by_title("stuff").markAsDone()
    // "stuff" project marked as done
