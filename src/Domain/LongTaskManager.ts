import {Promise} from 'es6-promise';
import {LongTaskId} from "./LongTaskId";
import {LongTaskType} from "./LongTaskType";
import {UserId} from "../Shared/Values/UserId";
import {LongTaskStatus} from "./LongTaskStatus";
import {LongTaskProgress} from "./LongTaskProgress";
import {LongTaskProcessor} from "./LongTaskProcessor";
import {LongTaskAttributes} from "./LongTaskAttributes";
import {LongTaskRepository} from "./LongTaskRepository";
import {LongTaskProcessorConfiguration} from "./LongTaskProcessorConfiguration";

export interface LongTaskManager {
	/**
	 * The task manager needs to know how to map task types to task processors.
	 * @param configuration		The long task processor configuration that should be used for processing certain tasks.
	 */
	registerTaskProcessor(configuration: LongTaskProcessorConfiguration);

	/**
	 * Need to be able to share the registered task processor types with other systems.
	 * @return {Array <string>}
	 */
	getTaskProcessorKeys(): Array <string>;

	/**
	 * Start the system processing long tasks. The manager will continually retrieve tasks until it is shutdown.
	 */
	start(): void;

	/**
	 * Add a long task to the system for processing.
	 * @param  taskType			The type of task to be run.
	 * @param  params			Expecting valid JSON. eg. {students:[1,2,3,4], reportId:5}
	 * @param  ownerId			The owner who requested the task be added.
	 * @param  searchKey		Filter tasks based on this value.
	 * @return the long task id when the promise is resolved.
	 */
	addTask(taskType: LongTaskType, params: string, ownerId: UserId, searchKey: Array <string>): Promise <LongTaskId>;

	/**
	 * Update a task's progress.
	 * @param  taskId		The task that needs to be updated.
	 * @param  progress		The progress changes.
	 * @param  status		The status of the task.
	 * @return a success boolean when the promise is resolved.
	 */
	updateTask(taskId: LongTaskId, progress: LongTaskProgress, status: LongTaskStatus): Promise <void>;

	/**
	 * Mark a task as completed.
	 * @param  taskId		The task that should be set as completed.
	 * @param  progress		The final progress changes.
	 * @return a success boolean when the promise is resolved.
	 */
	completedTask(taskId: LongTaskId, progress: LongTaskProgress): Promise <void>;
	
	/**
	 * @param  taskId		The task that should be set as failed.
	 * @param  progress		The final progress changes before the task failed.
	 * @return a success boolean when the promise is resolved.
	 */
	failedTask(taskId: LongTaskId, progress: LongTaskProgress): Promise <void>;

	/**
	 * Cancel a queued or processing task.
	 * @param  taskId		The task that should be cancelled.
	 * @return a success boolean when the promise is resolved.
	 */
	cancelTask(taskId: LongTaskId): Promise <void>;

	/**
	 * Delete a queued or processing task.
	 * @param  taskId		The task that should be deleted.
	 * @return a success boolean when the promise is resolved.
	 */
	deleteTask(taskId: LongTaskId): Promise <void>;

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
