module("Model.Indexer")

test("manages its index correctly", function() {
  var Story = Model("story")

  var story1 = new Story({ project_id: 1 })
  var story2 = new Story({ project_id: 2 })
  var story3 = new Story({ project_id: 3 })

  Story.collection.push(story1, story2, story3)

  var index = new Model.Indexer(Story.collection, "project_id")

  ok(index.get(1).first() === story1, "index is populated")
  ok(index.get(2).first() === story2, "index is populated")
  ok(index.get(3).first() === story3, "index is populated")

  var story4 = new Story({ project_id: 4 })

  equal(index.get(4).length, 0, "empty keys respond to the same interface")

  Story.collection.add(story4)

  equal(index.get(4).length, 1, "index includes models added to the collection")

  story4.set("project_id", 1)

  equal(index.get(1).length, 2, "index is kept up to date with updated models")
  ok(index.get(1).first() === story1)
  ok(index.get(1).last() === story4)
  equal(index.get(4).length, 0)

  equal(story2._events["change:project_id"].length, 1, "just checking")

  Story.collection.remove(story2)

  equal(index.get(2).length, 0, "model is removed from the index")
  equal(story2._events["change:project_id"].length, 0, "Indexer callbacks are cleaned up")
})
