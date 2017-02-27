import {Promise} from 'es6-promise';
import {LongTaskInfo} from "./LongTaskInfo";
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

	// forward to the registry.
	// register(type: LongTaskType, factory: LongTaskFactory): void;


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
	// REMOVE

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
	// REMOVE

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
	// REMOVE

	/**
	 * Retrieve the tasks that are currently processing.
	 * 
	 * @return an array of tasks when the promise resolves.
	 */
	getTasksCurrentlyProcessing(): Promise <Array <LongTaskInfo>>;
}
