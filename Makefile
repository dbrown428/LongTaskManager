PROJECT = "long-task-manager"

default: ;@echo "Building ${PROJECT}"; \
	  bin/build;

test: test-unit

clean: ;@echo "Cleaning ${PROJECT}"; \
	rm -fr build;

test-unit: ;@echo "Unit Testing ${PROJECT}"; \
	node_modules/.bin/mocha --compilers ts:ts-node/register,tsx:ts-node/register --recursive -R dot "tests/unit/**/*.spec.ts"

test-integration: ;@echo "Integration Testing ${PROJECT}"; \
	node_modules/.bin/mocha --compilers ts:ts-node/register,tsx:ts-node/register --recursive -R dot "tests/integration/**/*.spec.ts"

test-all: ;@echo "Testing ${PROJECT}"; \
	node_modules/.bin/mocha --compilers ts:ts-node/register,tsx:ts-node/register --recursive -R dot "tests/**/*.spec.ts"

.PHONY: test test-unit test-integration default
	