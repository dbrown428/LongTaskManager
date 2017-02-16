import {PackageFilesDummy} from "./PackageFilesDummy";
import {LongTaskType} from "../../src/Domain/LongTaskType";
import {LongTaskProcessor} from "../../src/Domain/LongTaskProcessor";
import {LongTaskProcessorConfiguration} from "../../src/Domain/LongTaskProcessorConfiguration";

export class PackageFilesProcessorConfigurationDummy implements LongTaskProcessorConfiguration {
	public key(): LongTaskType {
		return new LongTaskType("PackageFilesDummy");
	}

	public default(): LongTaskProcessor {
		return new PackageFilesDummy;
	}
}
