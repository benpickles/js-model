module("Model events")

test("", function() {
  var User = Model("user")
  var user = new User({ name: "Bill", preference: "yes" })
  var attrs = []

  user.bind("change", function(changed) {
    console.log(arguments)
    ok(this === user)
    attrs.push(changed)
  })

  user
    .attr("name", "Ben")
    .attr({
      name: "Bob",
      preference: "no"
    })

  deepEqual(attrs[0], ["name"])
  deepEqual(attrs[1].sort(), ["name", "preference"])
})
