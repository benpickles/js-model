### `Model(name, func)`

`Model()` is a factory method that is used to generate model classes. At its simplest it can be used like so:

    var Project = Model("project")

The optional function is used to define custom methods and properties on your newly defined class and its prototype using [`extend()`](#extend) and [`include()`](#include).

    var Project = Model("project", function() {
      this.extend({
        find_by_title: function(title) {
          return this.detect(function() {
            return this.attr("title") == title
          })
        }
      })

      this.include({
        markAsDone: function() {
          this.attr("done", true)
        }
      })
    })

    Project.find_by_title("stuff").markAsDone()
    // "stuff" project marked as done

The function is also called with two arguments: the class itself and its prototype. The above could be written as:

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
