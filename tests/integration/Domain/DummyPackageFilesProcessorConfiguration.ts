import {DummyPackageFiles} from "./DummyPackageFiles";
import {LongTaskType} from "../../../src/Domain/LongTaskType";
import {LongTaskProcessor} from "../../../src/Domain/LongTaskProcessor";
import {LongTaskProcessorConfiguration} from "../../../src/Domain/LongTaskProcessorConfiguration";

export class DummyPackageFilesProcessorConfiguration implements LongTaskProcessorConfiguration {
	public key(): LongTaskType {
		return {type: "DummyPackageFiles"};
	}

	public default(): LongTaskProcessor {
		return new DummyPackageFiles;
	}
}
