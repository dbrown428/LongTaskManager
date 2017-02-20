import {LongTask} from "./LongTask";
import {LongTaskManager} from "./LongTaskManager";

/**
 * A task status moves through the following states: Queued > Processing (Claimed) > Completed | Failed
 * The user can cancel a task at any time it is Queued or Processing.
 * 
 * It is your responsibility to define how you want your task to fail. For example, if you're processing 
 * a list, should one item failure stop the entire task? Or should the failure be recorded and continue 
 * processing the remaining items?
 */

export interface LongTaskProcessor {
	/**
	 * The LongTaskManager will call this method asyncronously. Your long task procesor should provide 
	 * periodic updates to the long task manager.
	 * 
	 * @param  task			The task that should be processed.
	 * @param  manager		The task processor will report back status to the manager.
	 */
	async execute(task: LongTask, manager: LongTaskManager): void
}
