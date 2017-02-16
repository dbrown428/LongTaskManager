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

// Consider splitting up:

// LongTasksReadRepository
// - taskWithId
// - tasksSithSearchKey
// - tasksWithUserId
// - nextTask / nextTasks?
// - expiredProcessingTasks

// LongTasksWriteRepository
// - add
// - claim
// - release
// - update
// - delete
// - cancel

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
	add(type: LongTaskType, params: LongTaskParameters, ownerId: UserId, searchKey: string | Array <string>): Promise <LongTaskId>;

	/**
	 * Retrieve a task with the specified identifier
	 * @param  taskId 		The specified task to retrieve.
	 * @return A task may or may not be defined.
	 */
	getTaskWithId(taskId: LongTaskId): Promise <Option <LongTask>>;

	/**
	 * Retrieve the next task that is queued.
	 * 
	 * @return A task may or may not be defined.
	 */
	getNextTask(): Promise <Option <LongTask>>;

	/**
	 * Retrieve all processing tasks with a claim older than the specified duration.
	 * 
	 * @param  duration		A duration from now into the past.
	 * @param  date			The reference date-time.
	 * @return Promise
	 */
	getProcessingTasksWithClaimOlderThanDurationFromDate(duration: Duration, date: Date): Promise <Array <LongTask>>;

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
	 * Claim a task for processing.
	 * 
	 * @param  taskId   The task the system wants to claim.
	 * @param  claimId	Expecting the claim identifier.
	 * @return Promise
	 *
	 * @throws RangeError 	If the taskId is not found.
	 * @throws Error		If the task is already claimed.
	 */
	claim(taskId: LongTaskId, claim: LongTaskClaim): Promise <void>;

	/**
	 * Release (unclaim) a task so it can be picked up for processing again.
	 * 
	 * @param  taskId		The task to be released.
	 * @return Promise
	 *
	 * @throws RangeError 	If the taskId is not found.
	 * @throws Error 		If the task is not claimed and you attempt to release it.
	 */
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
	 *                		in an exception being thrown.
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
