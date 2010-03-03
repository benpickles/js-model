module("Model.Errors");

test("add, clear, length", function() {
  var errors = new Model.Errors();

  equals(errors.length, 0);
  same(errors.on("body"), []);
  same(errors.on("title"), []);

  errors.add("title", "can't be blank");

  equals(errors.length, 1);
  same(errors.on("body"), []);
  same(errors.on("title"), ["can't be blank"]);

  errors.add("title", "must be more than 1 character");

  equals(errors.length, 2);
  same(errors.on("body"), []);
  same(errors.on("title"), ["can't be blank", "must be more than 1 character"]);

  errors.clear();

  equals(errors.length, 0);
  same(errors.on("body"), []);
  same(errors.on("title"), []);
});
