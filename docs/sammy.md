## js-model &hearts; Sammy

js-model works really well with Sammy -- you *are* using [Sammy](http://code.quirkey.com/sammy/) right? Your routes might look something like this:

    $.sammy(function() {
      this.get("#/projects", function() {
        var projects = Project.all()
        // display list of projects
      })

      this.post("#/projects", function(context) {
        var project = new Project(this.params.project)
        project.save(function(success) {
          if (success) {
            context.redirect("#/projects/" + project.id())
          } else {
            // display errors...
          }
        })
      })

      this.get("#/projects/:id", function() {
        var project = Project.find(this.params.id)
        // display project
      })

      this.put("#/projects/:id", function(context) {
        var project = Project.find(this.params.id)
        project.set(this.param.project)
          .save(function(success) {
            if (success) {
              context.redirect("#/projects/" + project.id())
            } else {
              // display errors...
            }
          })
      })

      this.route("delete", "#/projects/:id", function(context) {
        Project.find(this.params.id)
          .destroy(function() {
            context.redirect("#/projects")
          })
      })
    })
