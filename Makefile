PROJECT = "long-task-manager"

default: ;@echo "Building ${PROJECT}"; \
	  bin/build;

clean: ;@echo "Cleaning ${PROJECT}"; \
	rm -fr build;

demo: ;echo "Running ${PROJET} demo"; \
	tsc "tests/demo.ts"

test: ;@echo "Testing ${PROJECT}"; \
	node_modules/.bin/mocha --compilers ts:ts-node/register,tsx:ts-node/register --recursive -R dot "tests/**/*.spec.ts"

test-unit: ;@echo "Unit Testing ${PROJECT}"; \
	node_modules/.bin/mocha --compilers ts:ts-node/register,tsx:ts-node/register --recursive -R dot "tests/unit/**/*.spec.ts"

test-integration: ;@echo "Integration Testing ${PROJECT}"; \
	node_modules/.bin/mocha --compilers ts:ts-node/register,tsx:ts-node/register --recursive -R dot "tests/integration/**/*.spec.ts"

test-system: ;@echo "System Testing ${PROJECT}"; \
	node_modules/.bin/mocha --compilers ts:ts-node/register,tsx:ts-node/register --recursive -R dot "tests/system/**/*.spec.ts"

.PHONY: test test-unit test-integration test-system default
	