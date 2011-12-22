module("Collection")

test("#push, #pop, #splice, #shift and #unshift work and maintain the #length", function() {
  var Post = Model("post")
  var collection = new Model.Collection()

  var a = new Post({ title: "a" })
  var b = new Post({ title: "b" })
  var c = new Post({ title: "c" })

  equal(collection.push(a), 1)
  equal(collection.push(b), 2)
  equal(collection.push(c), 3)

  equal(collection.length, 3)
  ok(collection[0] === a)
  ok(collection[1] === b)
  ok(collection[2] === c)

  var spliced = collection.splice(2, 1)
  equal(spliced.length, 1)
  ok(spliced[0] === c)
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

  ok(reversed[0] === c)
  ok(reversed[1] === b)
  ok(reversed[2] === a)
  ok(reversed instanceof Model.Collection, "returns another Collection")
})

test("#sort, #sortBy", function() {
  var Post = Model("post")
  var collection = new Model.Collection()

  var a = new Post({ title: "a" })
  var b = new Post({ title: "b" })
  var c = new Post({ title: "c" })

  collection.push(b, a, c)

  var sorted = collection.sort()

  ok(sorted[0] === b)
  ok(sorted[1] === a)
  ok(sorted[2] === c)
  ok(sorted instanceof Model.Collection, "returns another Collection")

  sorted = collection.sortBy("title")

  ok(sorted[0] === a)
  ok(sorted[1] === b)
  ok(sorted[2] === c)
  ok(sorted instanceof Model.Collection, "returns another Collection")
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
    return post.attr("title") === "a"
  }, obj)

  same(indexes, [0, 1])

  ok(!every)

  b.attr("title", "a")
  c.attr("title", "a")

  every = collection.every(function(post) {
    return post.attr("title") === "a"
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
  ok(filtered[0] === c)
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
    return post.attr("title")
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
    return post.attr("title") === "a"
  }, obj)

  ok(some)

  some = collection.some(function(post) {
    return post.attr("title") === "z"
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

  ok(collection.remove(b) === b)
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
