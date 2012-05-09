### Persistence interface

Persistence adapters implement CRUD and return an object with the following interface. You probably don't need to know this but is documented here in case you want to implement your own.

#### `save(model, callback)`

Calls the supplied callback with a boolean indicating whether the action was a success or not and any further parameters that the persistence adapter sends.

    Project.persistence().save(project, function(success) {
      // do something...
    })

#### `destroy(model, callback)`

Calls the supplied callback with a boolean indicating whether the action was a success or not and any further parameters that the persistence adapter sends.

    Project.persistence().destroy(project, function(success) {
      // do something...
    })

#### `read(callback)`

Calls the supplied callback with an array of models -- models are **not** automatically added to the collection when calling `read()`. You probably won't need to use this much as this functionality is taken care of by [`load()`](#load).

    Project.persistence().read(function(models) {
      // do something with the models...
    })
