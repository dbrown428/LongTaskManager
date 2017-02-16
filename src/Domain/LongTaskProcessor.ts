import {LongTask} from "./LongTask";
import {LongTaskManager} from "./LongTaskManager";

/**
 * A task status moves through the following states: Queued > Processing (Claimed) > Completed | Failed
 * The user can cancel a task any time it is Queued or Processing. For tasks that are processing your 
 * LongTaskProcessor should check to see if the status has changed so it can promptly respond.
 */

export interface LongTaskProcessor {
	/**
	 * The LongTaskManager will call this method asyncronously. Your long task procesor should provide 
	 * periodic updates to the long task manager.
	 * 
	 * @param  task			The task that should be processed.
	 * @param  manager		The task processor will report back status to the manager.
	 */
	execute(task: LongTask, manager: LongTaskManager): void
}
