function assertSameModels(actual, expected) {
  if (!$.isArray(actual)) {
    ok(false, "Array not passed")
    return
  }

  equals(actual.length, expected.length, "Same number of models")

  $.each(expected, function(i, model) {
    ok(model === actual[i])
  })
}
