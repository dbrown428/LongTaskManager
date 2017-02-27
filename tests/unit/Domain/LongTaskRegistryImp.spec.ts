import {assert} from "chai";
import {LongTaskRegistryImp} from "../../../src/Domain/LongTaskRegistryImp";
import {LongTaskConfigurationDummy} from "../../doubles/LongTaskConfigurationDummy";
import {LongTaskConfigurationDummy2} from "../../doubles/LongTaskConfigurationDummy2";
import {DelayedResultsLongTaskConfiguration} from "../../doubles/DelayedResultsLongTaskConfiguration";
import {LongTaskRegistryDuplicateKeyException} from "../../../src/Domain/LongTaskRegistryDuplicateKeyException";
import {LongTaskRegistryDuplicateProcessorException} from "../../../src/Domain/LongTaskRegistryDuplicateProcessorException";

describe("Long task registry", () => {
	it("should return false if the key does not exist.", () => {
		const registry = new LongTaskRegistryImp;
		assert.isFalse(registry.contains("hello"));
	});

	it("should return true if the key does exist.", () => {
		const registry = new LongTaskRegistryImp;
		registry.add(new LongTaskConfigurationDummy);
		assert.isTrue(registry.contains("make-great-things-happen"));
	})

	it("should throw an exception when no processor exists for the specified key.", () => {
		const registry = new LongTaskRegistryImp;
		assert.throws(() => {
			registry.longTaskForKey("hello");
		}, RangeError);
	});

	it("should return an array of all the registered processors.", () => {
		const registry = new LongTaskRegistryImp;
		const config1 = new LongTaskConfigurationDummy;
		const config2 = new DelayedResultsLongTaskConfiguration;

		registry.add(config1);
		registry.add(config2);
		
		assert.isTrue(registry.contains(config1.key()));
		assert.isTrue(registry.contains(config2.key()));
	});

	it("should throw an exception when two processors with the same key are added.", () => {
		const registry = new LongTaskRegistryImp;
		registry.add(new LongTaskConfigurationDummy);

		assert.throws(() => {
			registry.add(new LongTaskConfigurationDummy);
		}, LongTaskRegistryDuplicateKeyException);
	});

	it("should throw an exception when two processors with the same class name are added.", () => {
		const registry = new LongTaskRegistryImp;
		registry.add(new LongTaskConfigurationDummy);

		assert.throws(() => {
			registry.add(new LongTaskConfigurationDummy2);
		}, LongTaskRegistryDuplicateProcessorException);
	});

	it("should return a long task instance for the specified key.", () => {
		const registry = new LongTaskRegistryImp;
		const config = new LongTaskConfigurationDummy;
		registry.add(config);
		
		const longTask = registry.longTaskForKey(config.key());
		assert.isNotNull(longTask);
	});

	it("should return a new long task instance for the specified key? REVIEW");
});
