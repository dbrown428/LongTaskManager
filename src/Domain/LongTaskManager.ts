import {Promise} from 'es6-promise';
import {LongTaskId} from "./LongTaskId";
import {LongTaskType} from "./LongTaskType";
import {UserId} from "../Shared/Values/UserId";
import {LongTaskProgress} from "./LongTaskProgress";
import {LongTaskParameters} from "./LongTaskParameters";

export interface LongTaskManager {
	/**
	 * Start the system processing long tasks. The manager will continually retrieve tasks.
	 */
	start(): void;

	/**
	 * Add a long task to the system for processing.
	 * 
	 * @param  taskType			The type of task to be run.
	 * @param  params			Parameters needed to process the task.
	 * @param  ownerId			The owner who requested the task be added.
	 * @param  searchKey		Filter tasks based on this value.
	 * @return the long task id when the promise is resolved.
	 *
	 * @throws LongTaskTypeUnregisteredException when the LongTaskType has not been registered with the system.
	 */
	addTask(taskType: LongTaskType, params: LongTaskParameters, ownerId: UserId, searchKey: string | Array <string>): Promise <LongTaskId>;

	/**
	 * Update the task progress. Most tasks can be broken into logical steps,
	 * and after each step or a batch of steps have completed you should update progress.
	 * The system will requeue your long task after you report progress, so your task 
	 * should terminate after you report progress.
	 * 
	 * Your long task should not attempt to execute the entire task in one run, but instead 
	 * think of how many steps of this task can I safely get done in 200ms or less?
	 * 
	 * @param  taskId		The task that needs to be updated.
	 * @param  progress		The progress changes.
	 * @return promise
	 *
	 * @throws
	 */
	updateTaskProgress(taskId: LongTaskId, progress: LongTaskProgress): Promise <void>;

	/**
	 * Mark a task as completed.
	 * 
	 * @param  taskId		The task that should be set as completed.
	 * @param  progress		The final progress changes.
	 * @return promise
	 *
	 * @throws
	 */
	completedTask(taskId: LongTaskId, progress: LongTaskProgress): Promise <void>;
	
	/**
	 * Mark a task as failed.
	 * 
	 * @param  taskId		The task that should be set as failed.
	 * @param  progress		The final progress changes before the task failed.
	 * @return promise
	 *
	 * @throws
	 */
	failedTask(taskId: LongTaskId, progress: LongTaskProgress): Promise <void>;

	/**
	 * Cancel a queued or processing task.
	 * 
	 * @param  taskId		The specific task that should be cancelled.
	 * @return promise
	 *
	 * @throws
	 */
	cancelTask(taskId: LongTaskId): Promise <void>;

	/**
	 * Delete a queued or processing task.
	 * 
	 * @param  taskId		The task that should be deleted.
	 * @return promise
	 *
	 * @throws
	 */
	deleteTask(taskId: LongTaskId): Promise <void>;

	/**
	 * Retrieve the tasks that are currently processing.
	 * 
	 * @return an array of tasks when the promise resolves.
	 */
	getTasksCurrentlyProcessing(): Promise <Array <LongTask>>;

	/**
	 * Retrieve all tasks that match the search key(s).
	 * 
	 * @param  searchKey	A string or array of strings to filter
	 * @return an array of tasks when the promise resolves.
	 */
	getTasksForSearchKey(searchKey: string | Array <string>): Promise <Array <LongTask>>;

	/**
	 * Retrieve all tasks that match the specified userId.
	 * 
	 * @param  userId		The userId to search for.
	 * @return an array of tasks when the promise resolves.
	 */
	getTasksForUserId(userId: UserId): Promise <Array <LongTask>>;
}
