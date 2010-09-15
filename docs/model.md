### `Model(name, classProperties, instanceProperties)`

`Model()` is a factory method that is used to generate model classes. At its simplest it can be used like so:

    var Project = Model("project")

The second and third arguments are optional and define properties on your newly defined class and model instances respectively.

    var Project = Model("project", {
      find_by_title: function(title) {
        return this.detect(function() {
          return this.attr("title") == title
        })
      }
    }, {
      markAsDone: function() {
        this.attr("done", true)
      }
    })

    Project.find_by_title("stuff").markAsDone()
    // "stuff" project marked as done
