import {LongTaskType} from "./LongTaskType";
import {LongTaskParameters} from "./LongTaskParameters";
import {UserId} from "../Shared/Values/UserId";
import {LongTaskId} from "./LongTaskId";
import {LongTaskInfo} from "./LongTaskInfo";

export interface LongTaskApi {
	/**
	 * Create a long task to the system for processing.
	 * 
	 * @param  taskType			The type of task to be run.
	 * @param  params			Parameters needed to process the task.
	 * @param  ownerId			The owner who requested the task be added.
	 * @param  searchKey		Filter tasks based on this value.
	 * @return the long task id when the promise is resolved.
	 *
	 * @throws LongTaskTypeUnregisteredException when the LongTaskType has not been registered with the system.
	 */
	createTask(taskType: LongTaskType, params: LongTaskParameters, ownerId: UserId, searchKey: string | Array <string>): Promise <LongTaskId>;

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
	 * Retrieve all tasks that match the search key(s).
	 * 
	 * @param  searchKey	A string or array of strings to filter
	 * @return an array of tasks when the promise resolves.
	 */
	getTasksForSearchKey(searchKey: string | Array <string>): Promise <Array <LongTaskInfo>>;

	/**
	 * Retrieve all tasks that match the specified userId.
	 * 
	 * @param  userId		The userId to search for.
	 * @return an array of tasks when the promise resolves.
	 */
	getTasksForUserId(userId: UserId): Promise <Array <LongTaskInfo>>;
}
