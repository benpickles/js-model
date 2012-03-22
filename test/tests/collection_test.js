module("Collection")

test("#push, #pop, #splice, #shift, #unshift", function() {
  var Post = Model("post")
  var collection = new Model.Collection()

  var a = new Post({ title: "a" })
  var b = new Post({ title: "b" })
  var c = new Post({ title: "c" })

  equal(collection.push(a), 1)
  equal(collection.push(b), 2)
  equal(collection.push(c), 3)

  equal(collection.length, 3)
  ok(collection.at(0) === a)
  ok(collection.at(1) === b)
  ok(collection.at(2) === c)

  var spliced = collection.splice(2, 1)
  ok(spliced instanceof Model.Collection, "returns a new Collection")
  equal(spliced.length, 1)
  ok(spliced.at(0) === c)
  equal(collection.length, 2)

  ok(collection.pop() === b)
  equal(collection.length, 1)
  ok(collection.pop() === a)
  equal(collection.length, 0)

  equal(collection.push(a, b, c), 3)
  equal(collection.length, 3)

  ok(collection.shift() === a)
  equal(collection.length, 2)

  equal(collection.unshift(a), 3)
  equal(collection.length, 3)
})

test("#indexOf", function() {
  var Post = Model("post")
  var collection = new Model.Collection()

  var a = new Post({ title: "a" })
  var b = new Post({ title: "b" })
  var c = new Post({ title: "c" })

  collection.push(a, b, c)

  equal(collection.indexOf(a), 0)
  equal(collection.indexOf(b), 1)
  equal(collection.indexOf(c), 2)
})

test("#lastIndexOf", function() {
  var Post = Model("post")
  var collection = new Model.Collection()

  var a = new Post({ title: "a" })
  var b = new Post({ title: "b" })
  var c = new Post({ title: "c" })

  collection.push(a, b, c, b, a)

  equal(collection.lastIndexOf(a), 4)
  equal(collection.lastIndexOf(b), 3)
  equal(collection.lastIndexOf(c), 2)
})

test("#reverse", function() {
  var Post = Model("post")
  var collection = new Model.Collection()

  var a = new Post({ title: "a" })
  var b = new Post({ title: "b" })
  var c = new Post({ title: "c" })

  collection.push(a, b, c)

  var reversed = collection.reverse()

  ok(reversed instanceof Model.Collection, "returns another Collection")
  ok(reversed.at(0) === c)
  ok(reversed.at(1) === b)
  ok(reversed.at(2) === a)
})

test("#sort, #sortBy", function() {
  var Post = Model("post")
  var collection = new Model.Collection()

  var a = new Post({ i: 0, title: "a" })
  var b = new Post({ i: 1, title: "b" })
  var c = new Post({ i: 2, title: "c" })

  collection.push(b, a, c)

  var sorted = collection.sort(function(a, b) {
    return a.get("i") - b.get("i")
  })

  ok(sorted instanceof Model.Collection, "returns another Collection")
  ok(sorted.at(0) === a)
  ok(sorted.at(1) === b)
  ok(sorted.at(2) === c)

  sorted = collection.sortBy("title")

  ok(sorted instanceof Model.Collection, "returns another Collection")
  ok(sorted.at(0) === a)
  ok(sorted.at(1) === b)
  ok(sorted.at(2) === c)
})

test("#detect", function() {
  var Post = Model("post")
  var collection = new Model.Collection()

  var a = new Post({ title: "a" })
  var b = new Post({ title: "b" })
  var c = new Post({ title: "c" })

  collection.push(a, b, c)

  var indexes = []
  var obj = {}

  var detected = collection.detect(function(post, i, coll) {
    indexes.push(i)
    ok(coll === collection)
    ok(this === obj)
    return post.get("title") === "c"
  }, obj)

  same(indexes, [0, 1, 2])

  ok(detected === c)
})

test("#every", function() {
  var Post = Model("post")
  var collection = new Model.Collection()

  var a = new Post({ title: "a" })
  var b = new Post({ title: "b" })
  var c = new Post({ title: "c" })

  collection.push(a, b, c)

  var expected = { 0: a, 1: b, 2: c }
  var indexes = []
  var obj = {}

  var every = collection.every(function(post, i, coll) {
    ok(post === expected[i])
    indexes.push(i)
    ok(coll === collection)
    ok(this === obj)
    return post.get("title") === "a"
  }, obj)

  same(indexes, [0, 1])

  ok(!every)

  b.set("title", "a")
  c.set("title", "a")

  every = collection.every(function(post) {
    return post.get("title") === "a"
  })

  ok(every)
})

test("#filter", function() {
  var Post = Model("post")
  var collection = new Model.Collection()

  var a = new Post({ title: "a" })
  var b = new Post({ title: "b" })
  var c = new Post({ title: "c" })

  collection.push(a, b, c)

  var expected = { 0: a, 1: b, 2: c }
  var indexes = []
  var obj = {}

  var filtered = collection.filter(function(post, i, coll) {
    ok(post === expected[i])
    indexes.push(i)
    ok(coll === collection)
    ok(this === obj)
    return i > 1
  }, obj)

  same(indexes, [0, 1, 2])

  ok(filtered instanceof Model.Collection, "returns another Collection")

  equal(filtered.length, 1)
  ok(filtered.at(0) === c)
})

test("#forEach", function() {
  var Post = Model("post")
  var collection = new Model.Collection()

  var a = new Post({ title: "a" })
  var b = new Post({ title: "b" })
  var c = new Post({ title: "c" })

  collection.push(a, b, c)

  var expected = { 0: a, 1: b, 2: c }
  var indexes = []
  var obj = {}

  collection.forEach(function(post, i, coll) {
    ok(post === expected[i])
    indexes.push(i)
    ok(coll === collection)
    ok(this === obj)
    return i > 1
  }, obj)

  same(indexes, [0, 1, 2])
})

test("#map", function() {
  var Post = Model("post")
  var collection = new Model.Collection()

  var a = new Post({ title: "a" })
  var b = new Post({ title: "b" })
  var c = new Post({ title: "c" })

  collection.push(a, b, c)

  var expected = { 0: a, 1: b, 2: c }
  var indexes = []
  var obj = {}

  var mapped = collection.map(function(post, i, coll) {
    ok(post === expected[i])
    indexes.push(i)
    ok(coll === collection)
    ok(this === obj)
    return post.get("title")
  }, obj)

  same(mapped, ["a", "b", "c"])
})

test("#some", function() {
  var Post = Model("post")
  var collection = new Model.Collection()

  var a = new Post({ title: "a" })
  var b = new Post({ title: "b" })
  var c = new Post({ title: "c" })

  collection.push(a, b, c)

  var expected = { 0: a, 1: b, 2: c }
  var indexes = []
  var obj = {}

  var some = collection.some(function(post, i, coll) {
    ok(post === expected[i])
    indexes.push(i)
    ok(coll === collection)
    ok(this === obj)
    return post.get("title") === "a"
  }, obj)

  ok(some)

  some = collection.some(function(post) {
    return post.get("title") === "z"
  })

  ok(!some)
})

test("#add, #remove", function() {
  var Post = Model("post")
  var collection = new Model.Collection()

  var a = new Post({ title: "a" })
  var b = new Post({ title: "b" })
  var c = new Post({ title: "c" })

  collection.push(a, b)

  ok(!collection.add(a))
  equal(collection.length, 2)

  equal(collection.add(c), 3)
  equal(collection.length, 3)

  equal(collection.remove(b), 2, "returns new length")
  equal(collection.length, 2)

  collection.remove(b)
  equal(collection.length, 2)
})

test("#first, #last", function() {
  var Post = Model("post")
  var collection = new Model.Collection()

  var a = new Post({ title: "a" })
  var b = new Post({ title: "b" })
  var c = new Post({ title: "c" })

  collection.push(a, b, c)

  ok(collection.first() === a)
  ok(collection.last() === c)
})

test("#pluck", function() {
  var Post = Model("post")
  var collection = new Model.Collection()

  var a = new Post({ title: "a" })
  var b = new Post({ title: "b" })
  var c = new Post({ title: "c" })

  collection.push(a, b, c)

  same(collection.pluck("title"), ["a", "b", "c"])
})

test("#toArray", function() {
  var Post = Model("post")
  var collection = new Model.Collection()

  var a = new Post({ title: "a" })
  var b = new Post({ title: "b" })
  var c = new Post({ title: "c" })

  collection.push(a, b, c)

  var array = collection.toArray()

  ok(Object.prototype.toString.call(array) == "[object Array]")
  ok(array[0] == a)
  ok(array[1] == b)
  ok(array[2] == c)

  array[0] = "a"

  ok(collection.at(0) == a, "array modification doesn't touch collection")
})

test("#slice", function() {
  var Post = Model("post")
  var collection = new Model.Collection()

  var a = new Post({ title: "a" })
  var b = new Post({ title: "b" })
  var c = new Post({ title: "c" })

  collection.push(a, b, c)

  var sliced = collection.slice()

  ok(sliced instanceof Model.Collection, "returns another Collection")
  equal(sliced.length, 3)
  ok(sliced.at(0) === a)
  ok(sliced.at(1) === b)
  ok(sliced.at(2) === c)

  sliced = collection.slice(1, 2)

  ok(sliced instanceof Model.Collection, "returns another Collection")
  equal(sliced.length, 1)
  ok(sliced.at(0) === b)
})
