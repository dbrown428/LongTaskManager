import {assert} from "chai";
import {LongTaskRegistryImp} from "../../../src/Domain/LongTaskRegistryImp";
import {PackageFilesProcessorConfigurationDummy} from "../../doubles/PackageFilesProcessorConfigurationDummy";
import {ReportGeneratorProcessorConfigurationDummy} from "../../doubles/ReportGeneratorProcessorConfigurationDummy";

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
		registry.add(new PackageFilesProcessorConfigurationDummy);
		assert.isTrue(registry.contains("PackageFilesDummy"));
	})

	it("should throw an exception when no processor exists for the specified key.", () => {
		const registry = new LongTaskRegistryImp;
		assert.throws(() => {
			registry.processorForKey("hello");
		});
	});

	it("should return an array of all the registered processors.", () => {
		const registry = new LongTaskRegistryImp;
		registry.add(new PackageFilesProcessorConfigurationDummy);
		registry.add(new ReportGeneratorProcessorConfigurationDummy);
		assert.lengthOf(registry.keys(), 2);
	});

	it("should return a processor for the specified key.", () => {
		const registry = new LongTaskRegistryImp;
		registry.add(new PackageFilesProcessorConfigurationDummy);
		const keys = registry.keys();
		const processor = registry.processorForKey(keys[0]);
		assert.isNotNull(processor);
	});
});
