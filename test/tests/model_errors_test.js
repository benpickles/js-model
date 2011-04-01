module("Model.Errors");

test("add, clear, size, each", function() {
  var errors = new Model.Errors();

  equal(errors.size(), 0);
  deepEqual(errors.on("body"), []);
  deepEqual(errors.on("title"), []);

  var results = [];
  var eachFunc = function(attribute, message) {
    results.push(this, attribute, message);
  };

  errors.each(eachFunc);

  deepEqual(results, []);

  errors.add("title", "can't be blank");

  equal(errors.size(), 1);
  deepEqual(errors.on("body"), []);
  deepEqual(errors.on("title"), ["can't be blank"]);

  errors.add("title", "must be more than 1 character");

  equal(errors.size(), 2);
  deepEqual(errors.on("body"), []);
  deepEqual(errors.on("title"), ["can't be blank", "must be more than 1 character"]);

  results = [];

  errors.each(eachFunc);

  deepEqual(results, [
    errors, "title", "can't be blank",
    errors, "title", "must be more than 1 character"
  ]);

  errors.add("body", "can't be blank");

  results = [];

  errors.each(eachFunc);

  deepEqual(results, [
    errors, "title", "can't be blank",
    errors, "title", "must be more than 1 character",
    errors, "body", "can't be blank"
  ]);

  errors.clear();

  equal(errors.size(), 0);
  deepEqual(errors.on("body"), []);
  deepEqual(errors.on("title"), []);
});
