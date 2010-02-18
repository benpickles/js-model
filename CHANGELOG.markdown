# Changelog

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
