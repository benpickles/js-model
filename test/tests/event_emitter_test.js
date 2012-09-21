module("EventEmitter")

test("binding with a scope and emitting with arguments", 3, function() {
  var ee = new Model.EventEmitter()
  var obj = {}

  ee.on("a", function(b, c) {
    equals(b, "b")
    equals(c, "c")
    ok(this === obj)
  }, obj)

  ee.emit("a", "b", "c")

  ee.off("a")

  ee.emit("a", "b", "c")
})

test("unbinding by callback", 2, function() {
  var ee = new Model.EventEmitter()
  var obj = {}
  var func1 = function(b, c) {
    ok(false)
  }
  var func2 = function(b, c) {
    equals(b, "b")
    equals(c, "c")
  }

  ee.on("a", func1)
  ee.on("a", func2)

  ee.off("a", func1)

  ee.emit("a", "b", "c")
})

test("unbinding by callback and scope", 1, function() {
  var ee = new Model.EventEmitter()
  var obj = {}
  var func = function() {
    ok(this !== obj)
  }

  ee.on("a", func)
  ee.on("a", func, obj)

  ee.off("a", func, obj)

  ee.emit("a")
})

test("emitting events with callbacks that unbind events", function () {
  var ee = new Model.EventEmitter,
      eventName = 'test',
      callbackCalled = false

  var handler = function () {
    ee.off(eventName, arguments.callee)
  }

  ee.on('test', handler)
  ee.on('test', function () { callbackCalled = true })

  ee.emit('test')

  ok(callbackCalled)

})
