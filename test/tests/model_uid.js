module("Model.UID")

test("UIDs shouldn't be the same", function() {
  var uid1 = Model.UID.generate()
  var uid2 = Model.UID.generate()

  ok(uid1 !== uid2, uid1 + " shouldn't equal " + uid2)
})
