import {Promise} from 'es6-promise';
import {LongTask} from "./LongTask";
import {LongTaskId} from "./LongTaskId";
import {LongTaskType} from "./LongTaskType";
import {LongTaskClaim} from "./LongTaskClaim";
import {UserId} from "../Shared/Values/UserId";
import {Option} from "../Shared/Values/Option";
import {Duration} from "../Shared/Values/Duration";
import {LongTaskStatus} from "./LongTaskAttributes";
import {LongTaskProgress} from "./LongTaskProgress";
import {LongTaskParameters} from "./LongTaskParameters";

export interface LongTaskRepository {
	/**
	 * Add a task to the repository.
	 * 
	 * @param  type		The type of task
	 * @param  params	The parameters needed to complete the task
	 * @param  ownerId  The owner of the job, eg. a teacher
	 * @param searchKey A string or array of strings that can be used for retrieving jobs.
	 * @return LongTaskId
	 */
	// create
	add(type: LongTaskType, params: LongTaskParameters, ownerId: UserId, searchKey: string | Array <string>): Promise <LongTaskId>;

	/**
	 * Retrieve an array of tasks given an array of LongTaskId
	 * @param  {Array <LongTaskId>} ids  The specified tasks to retrieve.
	 * @return {Promise}                 an array of tasks when the promise resolves.
	 */
	getTasksWithIds(ids: Array <LongTaskId>): Promise <Array <LongTask>>;

	/**
	 * Retrieve the next queued tasks up to the specified count.
	 * 
	 * @param  {number}  count the quantity of next tasks that should be retrieved.
	 * @return {Promise}       an array of long tasks.
	 */
	// name: string > some sort of identifier of who claimed them. eg. Manager instance name.
	claimNextQueuedTasks(count: number): Promise <Array <LongTask>>;

	/**
	 * Retrieve all processing tasks with a claim older than the specified duration.
	 * 
	 * @param  duration		A duration from now into the past.
	 * @param  date			The reference date-time.
	 * @return Promise
	 */
	getProcessingTasksWithClaimOlderThanDurationFromDate(duration: Duration, date: Date): Promise <Array <LongTask>>;
	// REMOVE ^^^^

	/**
	 * Retrieve tasks that match the search key.
	 * 
	 * @param  key		A search key to filter tasks with.
	 * @return Promise
	 */
	getTasksForSearchKey(key: string | Array <string>): Promise <Array <LongTask>>;

	/**
	 * Retrieve tasks that match the userId.
	 * 
	 * @param  identifier		A userId to filter tasks with.
	 * @return Promise
	 */
	getTasksForUserId(identifier: UserId): Promise <Array <LongTask>>;

	/**
	 * Release (unclaim) a task so it can be picked up for processing again. When you
	 * release a task you should nullify the claim_id and set the status to Queued.
	 * 
	 * @param  taskId		The task to be released.
	 * @return Promise
	 *
	 * @throws RangeError 	If the taskId is not found.
	 * @throws Error 		If the task is not claimed and you attempt to release it.
	 */
	
	// remove this... this is baked into update.
	release(taskId: LongTaskId): Promise <void>;

	/**
	 * Update the task with progress and status changes.
	 * 
	 * @param  taskId		The task that should be updated.
	 * @param  progress		The new state of the long task.
	 * @param  status		The current status of the task.
	 * @return Promise
	 *
	 * @throws RangeError 	If the taskId is not found.
	 * @throws Error 		If you attempt to change the status in an invalid way. The natural 
	 *         				flow is: Queued > Processing > Completed | Failed. Alternate status flows are:
	 *             			Queued > Cancelled, Failed > Queued. Anything outside of these flows will result
	 *                		in an exception being thrown. Processing > Queued is now valid. REDO.
	 */
	update(taskId: LongTaskId, progress: LongTaskProgress, status: LongTaskStatus): Promise <void>;
	
	/**
	 * Cancel a long running task.
	 * 
	 * @param  taskId		The specified task to cancel.
	 * @return promise
	 *
	 * @throws RangeError 	If the taskId is not found.
	 * @throws Error 		If you attempt to cancel a task that is marked as Failed, Completed, or Cancelled.
	 */
	cancel(taskId: LongTaskId): Promise <void>;

	/**
	 * Delete a long running task.
	 * 
	 * @param  taskId 		The specified task to delete.
	 * @return Promise
	 *
	 * @throws RangeError	If the taskId is not found.
	 */
	delete(taskId: LongTaskId): Promise <void>;
}
