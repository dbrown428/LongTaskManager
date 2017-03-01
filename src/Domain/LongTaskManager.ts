import {Promise} from 'es6-promise';
import {LongTask} from "./LongTask";
import {LongTaskInfo} from "./LongTaskInfo";
import {LongTaskType} from "./LongTaskType";

export interface LongTaskManager {
	
	// Use closure as outlined by Ryan...
	// LongTaskManager.register(DownloadMediaLongTask.type, longTaskInfo => {
	// 	  return DownloadMediaLongTask(longTaskInfo, httpClient, jsonApi);
	// });
	register(type, longTaskInfo: (task: LongTaskInfo) => LongTask): void;

	/**
	 * Start the system processing long tasks. The manager will continually retrieve tasks.
	 */
	start(): void;

	/**
	 * Retrieve the tasks that are currently processing.
	 * 
	 * @return an array of tasks when the promise resolves.
	 */
	getTasksCurrentlyProcessing(): Promise <Array <LongTaskInfo>>;
}
