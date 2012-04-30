SRC = src/header.js \
      src/model.js \
      src/model_version.js \
      src/model_utils.js \
      src/event_emitter.js \
      src/model_uid.js \
      src/model_model.js \
      src/model_class_methods.js \
      src/model_errors.js \
      src/collection.js \
      src/model_rest.js \
      src/null_persistence.js \
      src/model_local_storage.js \
      src/indexer.js

VERSION = $(shell cat VERSION)

js-model.js: $(SRC)
	cat $^ | \
	sed "s/@VERSION/${VERSION}/" > $@

js-model.min.js: js-model.js
	uglifyjs < $< > $@

all:
	make clean docs

clean:
	rm -f js-model.js js-model.min.js

docs: js-model.min.js
	ruby -rubygems -rbundler/setup -Idocs/lib -rdocs -e "puts Docs.build" > index.html

.PHONY: docs
