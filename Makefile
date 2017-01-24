PROJECT = "long-task-manager"

default: ;@echo "Building ${PROJECT}"; \
	  bin/build;

test: test-unit

clean: ;@echo "Cleaning ${PROJECT}"; \
	rm -fr build;

test-unit: ;@echo "Unit Testing ${PROJECT}"; \
	node_modules/.bin/mocha --compilers ts:ts-node/register,tsx:ts-node/register --recursive -R dot "tests/unit/**/*.spec.ts"

.PHONY: test test-unit default
	