;(function(Model) {
  Model.Indexer = function(collection, attribute) {
    this.collection = collection
    this.attribute = attribute
    this.index = {}
    this.collection.on("add", this.add, this)
    this.collection.on("remove", this.remove, this)
    this.collection.forEach(this.add, this)
  }

  Model.Indexer.prototype.add = function(model) {
    this.get(this.toKey(model)).add(model)
    model.on("change:" + this.attribute, this.change, this)
  }

  Model.Indexer.prototype.change = function(model, from, to) {
    this.get(from).remove(model)
    this.get(to).add(model)
  }

  Model.Indexer.prototype.get = function(key) {
    return this.index[key] || (this.index[key] = new this.collection.constructor())
  }

  Model.Indexer.prototype.remove = function(model) {
    this.get(this.toKey(model)).remove(model)
    model.off("change:" + this.attribute, this.change, this)
  }

  Model.Indexer.prototype.toKey = function(model) {
    return model.get(this.attribute)
  }
})(Model);
