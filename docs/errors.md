### Errors

Errors are used in conjunction with [`validate()`](#validate) and are modelled after ActiveModel's errors.

**Note:** If you're using Rails 2.x you can get Rails 3-style `errors.to_json` by dropping this simple monkey patch into an initializer ([Gist](http://gist.github.com/350520)).

    module ActiveRecord
      class Errors
        def to_json
          inject({}) { |hash, error|
            attribute, message = error

            hash[attribute] ||= []
            hash[attribute] << message
            hash
          }.to_json
        end
      end
    end

#### `add(attributeName, errorMessage)`

Add an error message for the specified attribute

    project.errors.on("title")
    // => []

    project.errors
      .add("title", "should not be blank")
      .add("title", "should be Bar")

    project.errors.on("title")
    // => ["should not be blank", "should be Bar"]

#### `all()`

Returns an object containing all the errors.

    project.errors.all()
    // => { title: ["should not be blank", "should be Bar"] }

#### `clear()`

Clears all error messages (making the model [valid](#valid) once more).

    project.valid()
    // => false

    project.errors.clear()

    project.valid()
    // => true

#### `each(func)`

Iterate over all error messages.

    project.errors.each(function(attribute, message) {
      // display error messages somewhere
    })

#### `on(attributeName)`

Return an array of error messages for the specified attribute.

    project.errors.on("title")
    // => ["should not be blank", "should be Bar"]

    project.errors.on("foo")
    // => []

#### `size()`

Returns a count of the total error messages on the model.

    project.errors.size()
    // => 2
