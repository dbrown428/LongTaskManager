import {Promise} from 'es6-promise';
import {LongTask} from "./LongTask";
import {LongTaskId} from "./LongTaskId";
import {LongTaskClaim} from "./LongTaskClaim";
import {UserId} from "../Shared/Values/UserId";
import {Option} from "../Shared/Values/Option";
import {Duration} from "../Shared/Values/Duration";
import {LongTaskStatus} from "./LongTaskAttributes";
import {LongTaskProgress} from "./LongTaskProgress";

export interface LongTaskRepository {
	/**
	 * Add a task to the repository.
	 * @param  type		Expecting a job type string.
	 * @param  params	Expecting JSON. eg. {students:[1,2,3,4], reportId:5}
	 * @param  ownerId  The owner of the job, eg. a teacher
	 * @param searchKey A string or array of strings that can be used for retrieving jobs.
	 * @return LongTaskId
	 */
	add(type: string, params: string, ownerId: UserId, searchKey: string | Array <string>): Promise <LongTaskId>;

	/**
	 * Retrieve a task with the specified identifier
	 * @param  taskId 		The specified task to retrieve.
	 * @return A task may or may not be defined.
	 */
	getTaskWithId(taskId: LongTaskId): Promise <Option <LongTask>>;

	/**
	 * Retrieve the next task that is queued.
	 * @return A task may or may not be defined.
	 */
	getNextTask(): Promise <Option <LongTask>>;

	/**
	 * Retrieve all processing tasks with a claim older than the specified duration.
	 * @param  duration		A duration from now into the past.
	 * @param  date			The reference date-time.
	 * @return a promise with zero or more tasks.
	 */
	getProcessingTasksWithClaimOlderThanDurationFromDate(duration: Duration, date: Date): Promise <Array <LongTask>>;

	/**
	 * Retrieve tasks that match the search key.
	 * @param  key		A search key to filter tasks with.
	 * @return A promise with zero or more tasks.
	 */
	getTasksForSearchKey(key: string | Array <string>): Promise <Array <LongTask>>;

	/**
	 * Retrieve tasks that match the userId.
	 * @param  identifier		A userId to filter tasks with.
	 * @return A promise with 0 or more tasks.
	 */
	getTasksForUserId(identifier: UserId): Promise <Array <LongTask>>;

	/**
	 * Claim a task for processing.
	 * @param  taskId   The task the system wants to claim.
	 * @param  claimId	Expecting the claim identifier.
	 * @return true if the claim was successful, false otherwise.
	 */
	claim(taskId: LongTaskId, claim: LongTaskClaim): Promise <void>;

	/**
	 * Release (unclaim) a task so it can be picked up for processing again.
	 * @param  taskId	The task to be released.
	 * @return The result of the release is returned when the promise is resolved.
	 */
	release(taskId: LongTaskId): Promise <void>;

	/**
	 * Update the task with progress and status changes.
	 * @param  taskId		The task that should be updated.
	 * @param  progress		The new state of the long task.
	 * @param  status		The current status of the task.
	 * @return boolean promise if the update succeeded or failed.
	 */
	update(taskId: LongTaskId, progress: LongTaskProgress, status: LongTaskStatus): Promise <void>;
	
	/**
	 * Cancel a long running task. The promise will be rejected if the task is already cancelled.
	 * @param  taskId	The specified task to cancel.
	 * @return boolean promise if the cancel succeeded or failed.
	 */
	cancel(taskId: LongTaskId): Promise <void>;

	/**
	 * Delete a long running task. The promise will be rejected if the task is already deleted.
	 * @param  taskId 	The specified task to delete.
	 * @return boolean promise if the delete succeeded or failed.
	 */
	delete(taskId: LongTaskId): Promise <void>;
}
