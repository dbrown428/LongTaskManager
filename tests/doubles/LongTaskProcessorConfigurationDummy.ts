import {LongTaskType} from "../../src/Domain/LongTaskType";
import {LongTaskProcessorDummy} from "./LongTaskProcessorDummy";
import {LongTaskProcessor} from "../../src/Domain/LongTaskProcessor";
import {LongTaskProcessorConfiguration} from "../../src/Domain/LongTaskProcessorConfiguration";

export class LongTaskProcessorConfigurationDummy implements LongTaskProcessorConfiguration {
	public key(): LongTaskType {
		return LongTaskType.withValue("make-great-things-happen");
	}

	public default(): LongTaskProcessor {
		return new LongTaskProcessorDummy;
	}
}
