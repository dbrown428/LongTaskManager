import {LongTask} from "../../src/Domain/LongTask";
import {LongTaskManager} from "../../src/Domain/LongTaskManager";
import {LongTaskProcessor} from "../../src/Domain/LongTaskProcessor";

export class MultipleItemsPerTaskProcessor implements LongTaskProcessor {
	public async tick(task: LongTask, manager: LongTaskManager): Promise <void> {
		
		// get task state
		// get next item to process.
		// write back progress to the manager.
		// done

		return Promise.resolve();
	}
}
