import {Promise} from 'es6-promise';
import {LongTaskInfo} from "./LongTaskInfo";
import {LongTaskId} from "./LongTaskId";
import {LongTaskType} from "./LongTaskType";
import {UserId} from "../Shared/Values/UserId";
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
	create(type: LongTaskType, params: LongTaskParameters, ownerId: UserId, searchKey: string | Array <string>): Promise <LongTaskId>;

	/**
	 * Retrieve an array of tasks given an array of LongTaskId
	 * @param  {Array <LongTaskId>} ids  The specified tasks to retrieve.
	 * @return {Promise}                 an array of tasks when the promise resolves.
	 */
	getTasksWithIds(ids: Array <LongTaskId>): Promise <Array <LongTaskInfo>>;

	/**
	 * Retrieve the next tasks for processing up to the specified count. This has to resolve
	 * concurrency. This will also retrieve at old/expired processing tasks and reclaim them.
	 * 
	 * @param  {number}  	count 	The quantity of next tasks that should be retrieved.
	 * @param  {string}  	name  	An identifier of who claimed them. eg. Manager instance name.
	 * @param  {Duration} 	cleanup	If a task has been processing for longer than the specified duration,
	 *                             	then it will be released and reclaimed.
	 * @return {Promise}       		An array of long tasks.
	 */
	claimNextTasks(count: number, claimName: string, cleanup: Duration): Promise <Array <LongTaskInfo>>;

	/**
	 * Retrieve tasks that match the search key.
	 * 
	 * @param  key		A search key to filter tasks with.
	 * @return Promise
	 */
	getTasksForSearchKey(key: string | Array <string>): Promise <Array <LongTaskInfo>>;

	/**
	 * Retrieve tasks that match the userId.
	 * 
	 * @param  identifier		A userId to filter tasks with.
	 * @return Promise
	 */
	getTasksForUserId(identifier: UserId): Promise <Array <LongTaskInfo>>;

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
	
	// long task manager -> on lease expired, remove from pool.
	// you tried to update something that has been claimed by someone else. 
	update(taskId: LongTaskId, progress: LongTaskProgress, status: LongTaskStatus): Promise <boolean>;	// enum: lease expired (given back to the pool), success
	
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
