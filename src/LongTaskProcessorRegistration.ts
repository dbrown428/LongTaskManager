import {LongTaskManager} from "./LongTaskManager";
import {PublishSummaryReportsTaskProcessorConfiguration} from "./PublishSummaryReportsTaskProcessorConfiguration";

export class LongTaskProcessorRegistration {
	/**
	 * This will register all the task processors in the system. 
	 * Developers are responsible for maintaining this list of task processors.
	 * @param manager 	The entity that we should register task processors in.
	 */
	public registerInManager(manager: LongTaskManager): void {

		// ==============================
		// Task processors go here.
		// ==============================
		manager.registerTaskProcessor(new PublishSummaryReportsTaskProcessorConfiguration);

	}
}
