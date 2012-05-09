## Persistence

js-model is different to several other solutions, it's not a REST-based proxy for the objects on your server and doesn't rely on constant HTTP requests to gather information. Instead, it looks up objects in its own cache which can be populated via a persistence adapter -- think of it as [maintaining the state of your objects in the browser](http://blog.new-bamboo.co.uk/2010/2/4/let-them-eat-state).

Persistence is defined as a [class property](#class-properties) and comes in two flavours: [REST](#rest) and [localStorage](#localstorage). Both adapters encode/decode your attributes with JSON and so require the browser to be JSON-aware (or to include the [JSON JavaScript library](http://www.json.org/js.html)). Persistence is defined using the [`persistence()`](#api-class-properties-persistence) method.

### REST

Uses jQuery's [`ajax()`](http://api.jquery.com/jQuery.ajax/) method to GET, POST, PUT and DELETE model data to the server as JSON and expects JSON back.

    var Project = Model("project", function() {
      this.persistence(Model.REST, "/projects")
    })

Calling [`save()`](#save) or [`destroy()`](#destroy) on an object now fires a corresponding REST request:

    var project = new Project({ name: "stuff" })
    project.save()                            //   POST /projects
    project.set("name", "nonsense").save()    //    PUT /projects/1
    project.destroy()                         // DELETE /projects/1

When responding to POST or PUT requests any JSON returned will be [merged](#merge) into the model's [`attributes`](#attributes) -- you should also make sure to include the id in the POST response so it can be assigned to the model. 422 responses from the server will be interpreted as having failed validations, any returned JSON will be assumed to be errors and replace client-side [`errors`](#api-errors).

**Note:** If you're using Rails you should make sure to add the following setting in an initializer as js-model expects non-namespaced JSON:

    ActiveRecord::Base.include_root_in_json = false

### localStorage

localStorage is a client-side key/value store that persists between page views and browser sessions, it's supported by Safari, Chrome, Firefox, Opera, IE8 and Safari Mobile (iPhone) -- WebKit-based browsers have an excellent localStorage GUI in the Web Inspector.

    var Project = Model("project", function() {
      this.persistence(Model.localStorage)
    })

### Loading data

If you have existing data stored in your persistence layer you'll want to be able to have it available when you next open your app. You'll typically call [`load()`](#load) when your document loads and perform an action when it has completed.

    // wait for the document to load
    $(function() {
      Project.load(function() {
        // do something with the UI
      })
    })
