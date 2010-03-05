module("Model.Errors");

test("add, clear, size, each", function() {
  var errors = new Model.Errors();

  equals(errors.size(), 0);
  same(errors.on("body"), []);
  same(errors.on("title"), []);

  var results = [];
  var eachFunc = function(attribute, message) {
    results.push(this, attribute, message);
  };

  errors.each(eachFunc);

  same(results, []);

  errors.add("title", "can't be blank");

  equals(errors.size(), 1);
  same(errors.on("body"), []);
  same(errors.on("title"), ["can't be blank"]);

  errors.add("title", "must be more than 1 character");

  equals(errors.size(), 2);
  same(errors.on("body"), []);
  same(errors.on("title"), ["can't be blank", "must be more than 1 character"]);

  results = [];

  errors.each(eachFunc);

  same(results, [
    errors, "title", "can't be blank",
    errors, "title", "must be more than 1 character"
  ]);

  errors.add("body", "can't be blank");

  results = [];

  errors.each(eachFunc);

  same(results, [
    errors, "title", "can't be blank",
    errors, "title", "must be more than 1 character",
    errors, "body", "can't be blank"
  ]);

  errors.clear();

  equals(errors.size(), 0);
  same(errors.on("body"), []);
  same(errors.on("title"), []);
});
