# Changelog

## 0.9.2

* Ajax DELETE sends JSON body, including AjaxSetup data if available. [Ismael Celis]
* `Model.remove()` should include removed instance in event data. [Ismael Celis]
* Call the `Model.load()` callback with the scope of the class.

## 0.9.1

* If defined, include jQuery.ajaxSetup data in REST parameters. [Ismael Celis]

## 0.9.0

* Finder methods now return `undefined` for a missing model.
* Remove #update method which you might guess acts like ActiveRecord's #update_attributes which is not the case - no calls are triggered on the persistence adapter.
* Model.RestPersistence renamed to Model.REST - Model.RestPersistence can still be used but will be removed in version 1.0.
* REST adapter now sends JSON instead of "application/x-www-form-urlencoded" (and so now requires the browser to be JSON-aware).
* Add `reverse` class method.
* Add Model.VERSION to allow inspection of js-model version.
* Add Model.localStorage persistence adapter.
* Stop jQuery's JSON parsing throwing an error when encountering Rails' none-empty " " JSON responses.
* Remove Underscore dependency.
* `Model.remove` method now takes a model instance rather than an id.
* Rename `sort` to `sortBy` and add the ability to specify an attribute name as well as a custom function. Add `sort` method that acts on a collection just like `Array#sort`.
* Add `pluck` method that takes an attribute name and returns an array of values.
* Fix for callbacks being wrongly called on multiple instances - they were being stored on the prototype and thus being shared across instances. Thanks to Oliver Nightingale for identifying the bug and writing a test case.

## 0.8.4

* Add named parameters to `Model.RestPersistence` so "/categories/:category_id/posts" will pick up the corresponding `category_id` attribute from your model and be converted to "/categories/2/posts". [Russell Jones]

## 0.8.3

* Fix that `find`, `first`, `last` and `detect` return `null` when nothing is found.
* Add `unbind` method to unbind all callbacks for a particular event or a specific callback by passing a reference to the original function.
* Move callback functionality into a separate module and mix-in to class and instance.

## 0.8.2

* Don't log an error when Rails returns a response of " " for a `head :ok` response.
* `jQuery.ajax` should use `dataType` "json" removing the need to set a global `beforeSend`. [Jason Lee]

## 0.8.1

* Fix that custom class methods should be available after chaining.

## 0.8.0

* Move model collection methods into a separate object allowing you to customise the defaults in a single place.
* Move model instance methods into a separate object. This allows you to redefine the defaults once rather than having to pass the same custom method to multiple models at declaration time.
* Defining a model now takes three arguments: name, class methods, instance methods.

## 0.7.3

* Fix callbacks in IE.
* Fix broken Ajax tests in IE6 and IE7.

## 0.7.1

* `Model.RestPersistence` now recognises a 422 response as validation failure and populates the model's errors object with the response data.
* `Model.errors` is now an object and has a similar interface to ActiveModel.
* Fix that `changes` should only be merged after a successful `save` (create/update).
* Calling Model#attr() with no arguments returns a combined object of attributes/changes.
* Fix that `Model.RestPersistence` Ajax failures should correctly run the supplied callback.
* Add `count` method to `Model.Collection`.
* Collection methods now access the collection through the `all` method so that `select`, `each`, etc work as expected if it's overwritten.

## 0.7.0

* Events are now bound directly to a model rather than using jQuery `bind`. Collections also now have the concept of events with "add" and "remove" built-in.

## 0.6.1

* `update` should trigger "update" event, add separate `merge` method.
* Fix that persistence failure should not trigger corresponding event.

## 0.6.0

* Pass only a single callback to save/destroy which is called with a boolean to indicate success/failure.
* Bundle release into a single, versioned Javascript file plus minified version.
* Change behaviour of `Model.Collection` and don't let duplicates (scoped by id) of the same model to be stored. [Laurie Young]

## 0.5.1

* Fix that setting a null value with `attr` should be read back correctly from `changes`.
* `errors` array shouldn't have to be manually `reset` when implementing `validate`.

## 0.5.0

* First tagged release.
