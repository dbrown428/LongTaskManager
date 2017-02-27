import {LongTaskType} from "../../src/Domain/LongTaskType";
import {LongTaskDummy} from "./LongTaskDummy";
import {LongTask} from "../../src/Domain/LongTask";
import {LongTaskConfigurationDummy} from "../../src/Domain/LongTaskConfigurationDummy";

export class LongTaskConfigurationDummy implements LongTaskConfiguration {
	public key(): LongTaskType {
		return LongTaskType.withValue("make-great-things-happen");
	}

	public default(): LongTask {
		return new LongTaskDummy;
	}
}
