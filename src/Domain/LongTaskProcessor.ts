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
	 * The LongTaskManager will call this method asyncronously. Most tasks can be broken 
	 * into logical steps, and after each step or a batch of steps have completed you 
	 * should update the manager with progress. The system will requeue your long task 
	 * after you report progress, so your task should terminate after you report progress.
	 * 
	 * Your long task should not attempt to execute the entire task in one run, but instead 
	 * think of how many steps of this task can I safely get done in 200ms or less?
	 *
	 * When you're task has finished processing all steps, make sure to update the manager
	 * with the completed progress.
	 * 
	 * @param  task			The task that should be processed.
	 * @param  manager		The task processor will report back status to the manager.
	 */
	tick(task: LongTask, manager: LongTaskManager): Promise <void>
}
