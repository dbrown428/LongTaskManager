import {LongTaskType} from "../../src/Domain/LongTaskType";
import {LongTaskDummy} from "./LongTaskDummy";
import {LongTask} from "../../src/Domain/LongTask";
import {LongTaskConfiguration} from "../../src/Domain/LongTaskConfiguration";

export class LongTaskConfigurationDummy2 implements LongTaskConfiguration {
	public key(): LongTaskType {
		return LongTaskType.withValue("make-decent-things-happen");
	}

	public default(): LongTask {
		return new LongTaskDummy;
	}
}
