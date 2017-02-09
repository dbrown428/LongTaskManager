import {LongTask} from "./LongTask";
import {LongTaskManager} from "./LongTaskManager";

export interface LongTaskProcessor {
	/**
	 * Asyncronously execute the task while providing periodic updates to the long task manager.
	 * @param  task			The task that should be processed.
	 * @param  manager		The task processor will report back status to the manager.
	 */
	execute(task: LongTask, manager: LongTaskManager): void
}
