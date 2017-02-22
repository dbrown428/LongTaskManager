import {LongTask} from "../../src/Domain/LongTask";
import {LongTaskManager} from "../../src/Domain/LongTaskManager";
import {LongTaskProcessor} from "../../src/Domain/LongTaskProcessor";

export class LongTaskProcessorDummy implements LongTaskProcessor {
	public tick(task: LongTask, manager: LongTaskManager): Promise <void> {
		return Promise.resolve();
	}
}
