var localStorageTest = function(name, func) {
  test(name, function() {
    localStorage.clear()
    func()
  })
}
