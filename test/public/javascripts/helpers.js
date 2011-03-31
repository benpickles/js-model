function assertSameModels(actual, expected) {
  equals(actual.length, expected.length, "Same number of models")

  $.each(expected, function(i, model) {
    ok(model === actual[i])
  })
}
