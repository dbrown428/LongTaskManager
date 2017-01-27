import {Option} from "./Option";
import {UserId} from "./UserId";
import {ClaimId} from "./ClaimId";
import {Promise} from 'es6-promise';
import {LongTask} from "./LongTask";
import {LongTaskId} from "./LongTaskId";

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
	 * Retrieve the next task that is queued.
	 * @return A task may or may not be defined.
	 */
	getNextTask(): Promise <Option <Task>>;

	/**
	 * Claim a job for processing.
	 * @param  taskId   The task the system wants to claim.
	 * @param  claimId	Expecting the claim identifier.
	 * @return true if the claim was successful, false otherwise.
	 */
	claim(taskId: LongTaskId, claim: ClaimId): Promise <boolean>;
	// release? <- if a job dies, we need to release it so it can be picked up again.

	/**
	 * Update the task with progress and status changes.
	 * @param  taskId		The task that should be updated.
	 * @param  progress		The new state of the long task.
	 * @param  status		The current status of the task.
	 * @return boolean promise if the update succeeded or failed.
	 */
	update(taskId: LongTaskId, progress: LongTaskProgress, status: LongTaskStatus): Promise <boolean>;
	
	/**
	 * Cancel a long running task. The promise will be rejected if the task is already cancelled.
	 * @param  taskId	The specified task to cancel.
	 * @return Promise with no resolved value (undefined)
	 */
	cancel(taskId: LongTaskId): Promise <any>;

	/**
	 * Delete a long running task. The promise will be rejected if the task is already deleted.
	 * @param  taskId 	The specified task to delete.
	 * @return Promise with no resolved value (undefined)
	 */
	delete(taskId: LongTaskId): Promise <any>;

	/**
	 * Retrieve tasks that match the search key.
	 * @param  key		A search key to filter tasks with.
	 * @return A promise with 0 or more tasks.
	 */
	getTasksForSearchKey(key: string): Promise <Array <LongTask>>;

	/**
	 * Retrieve tasks that match the userId.
	 * @param  identifier		A userId to filter tasks with.
	 * @return A promise with 0 or more tasks.
	 */
	getTasksForUserId(identifier: UserId): Promise <Array <LongTask>>;
}
