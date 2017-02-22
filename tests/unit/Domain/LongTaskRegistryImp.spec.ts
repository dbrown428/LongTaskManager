import {assert} from "chai";
import {LongTaskRegistryImp} from "../../../src/Domain/LongTaskRegistryImp";
import {LongTaskProcessorConfigurationDummy} from "../../doubles/LongTaskProcessorConfigurationDummy";
import {LongTaskProcessorConfigurationDummy2} from "../../doubles/LongTaskProcessorConfigurationDummy2";
import {DelayedResultsProcessorConfiguration} from "../../doubles/DelayedResultsProcessorConfiguration";
import {LongTaskRegistryDuplicateKeyException} from "../../../src/Domain/LongTaskRegistryDuplicateKeyException";
import {LongTaskRegistryDuplicateProcessorException} from "../../../src/Domain/LongTaskRegistryDuplicateProcessorException";

describe("Long task registry", () => {
	it("should return an empty array when no processors are registered.", () => {
		const registry = new LongTaskRegistryImp;
		assert.lengthOf(registry.keys(), 0);
	});

	it("should return false if the key does not exist.", () => {
		const registry = new LongTaskRegistryImp;
		assert.isFalse(registry.contains("hello"));
	});

	it("should return true if the key does exist.", () => {
		const registry = new LongTaskRegistryImp;
		registry.add(new LongTaskProcessorConfigurationDummy);
		assert.isTrue(registry.contains("make-great-things-happen"));
	})

	it("should throw an exception when no processor exists for the specified key.", () => {
		const registry = new LongTaskRegistryImp;
		assert.throws(() => {
			registry.processorForKey("hello");
		}, RangeError);
	});

	it("should return an array of all the registered processors.", () => {
		const registry = new LongTaskRegistryImp;
		registry.add(new LongTaskProcessorConfigurationDummy);
		registry.add(new DelayedResultsProcessorConfiguration);
		assert.lengthOf(registry.keys(), 2);
	});

	it("should throw an exception when two processors with the same key are added.", () => {
		const registry = new LongTaskRegistryImp;
		registry.add(new LongTaskProcessorConfigurationDummy);

		assert.throws(() => {
			registry.add(new LongTaskProcessorConfigurationDummy);
		}, LongTaskRegistryDuplicateKeyException);
	});

	it("should throw an exception when two processors with the same class name are added.", () => {
		const registry = new LongTaskRegistryImp;
		registry.add(new LongTaskProcessorConfigurationDummy);

		assert.throws(() => {
			registry.add(new LongTaskProcessorConfigurationDummy2);
		}, LongTaskRegistryDuplicateProcessorException);
	});

	it("should return a processor for the specified key.", () => {
		const registry = new LongTaskRegistryImp;
		registry.add(new LongTaskProcessorConfigurationDummy);
		const keys = registry.keys();
		const processor = registry.processorForKey(keys[0]);
		assert.isNotNull(processor);
	});
});
