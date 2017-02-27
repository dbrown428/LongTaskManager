import {LongTaskInfo} from "../../src/Domain/LongTaskInfo";
import {LongTaskManager} from "../../src/Domain/LongTaskManager";
import {LongTask} from "../../src/Domain/LongTask";

export class MultipleStepsLongTask implements LongTask {
	public async tick(task: LongTask, manager: LongTaskManager): Promise <void> {
		
		// get task state
		// get next item to process.
		// write back progress to the manager.
		// done

		return Promise.resolve();
	}
}
