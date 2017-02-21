import {Promise} from 'es6-promise';
import {LongTaskId} from "./LongTaskId";
import {LongTaskType} from "./LongTaskType";
import {UserId} from "../Shared/Values/UserId";
import {LongTaskProgress} from "./LongTaskProgress";
import {LongTaskParameters} from "./LongTaskParameters";

export interface LongTaskManager {
	/**
	 * Start the system processing long tasks. The manager will continually retrieve tasks until it dies.
	 */
	start(): void;

	/**
	 * Add a long task to the system for processing.
	 * @param  taskType			The type of task to be run.
	 * @param  params			Parameters needed to process the task.
	 * @param  ownerId			The owner who requested the task be added.
	 * @param  searchKey		Filter tasks based on this value.
	 * @return the long task id when the promise is resolved.
	 */
	addTask(taskType: LongTaskType, params: LongTaskParameters, ownerId: UserId, searchKey: string | Array <string>): Promise <LongTaskId>;

	/**
	 * Update a task's progress.
	 * @param  taskId		The task that needs to be updated.
	 * @param  progress		The progress changes.
	 * @return promise
	 *
	 * @throws
	 */
	updateTaskProgress(taskId: LongTaskId, progress: LongTaskProgress): Promise <void>;

	/**
	 * Mark a task as completed.
	 * @param  taskId		The task that should be set as completed.
	 * @param  progress		The final progress changes.
	 * @return promise
	 *
	 * @throws
	 */
	completedTask(taskId: LongTaskId, progress: LongTaskProgress): Promise <void>;
	
	/**
	 * @param  taskId		The task that should be set as failed.
	 * @param  progress		The final progress changes before the task failed.
	 * @return promise
	 *
	 * @throws
	 */
	failedTask(taskId: LongTaskId, progress: LongTaskProgress): Promise <void>;

	/**
	 * Cancel a queued or processing task.
	 * @param  taskId		The task that should be cancelled.
	 * @return promise
	 *
	 * @throws
	 */
	cancelTask(taskId: LongTaskId): Promise <void>;

	/**
	 * Delete a queued or processing task.
	 * @param  taskId		The task that should be deleted.
	 * @return promise
	 *
	 * @throws
	 */
	deleteTask(taskId: LongTaskId): Promise <void>;

	/**
	 * Retrieve the current task processing count.
	 * @return number
	 */
	processingCount(): number;

	/**
	 * Retrieve all tasks that match the search key(s).
	 * @param  searchKey	A string or array of strings to filter
	 * @return an array of tasks when the promise is resolved.
	 */
	getTasksForSearchKey(searchKey: string | Array <string>): Promise <Array <LongTask>>;

	/**
	 * Retrieve all tasks that match the specified userId.
	 * @param  userId		The userId to search for.
	 * @return an array of tasks when the promise is resolved.
	 */
	getTasksForUserId(userId: UserId): Promise <Array <LongTask>>;
}
