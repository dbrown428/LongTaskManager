import {Logger} from "../Shared/Log/Logger";
import {LongTaskManager} from "./LongTaskManager";
import {Backoff} from "../Shared/Backoff/Backoff";
import {LongTaskTracker} from "./LongTaskTracker";
import {LongTaskRegistry} from "./LongTaskRegistry";
import {LongTaskSettings} from "./LongTaskSettings";
import {LongTaskRepository} from "./LongTaskRepository";

interface LongTaskManagerConstructor {
	/**
	 * Create a new long task manager.
	 * 
	 * @param {Logger}             logger     Log debugging information (warnings, errors, info...etc)
	 * @param {Backoff}            backoff    Use the backoff strategy that works best for your purposes.
	 * @param {LongTaskSettings}   settings   Define concurrency and other settings to alter the behaviour of the manager.
	 * @param {LongTaskTracker}    processing Keep track of long tasks that are processing.
	 * @param {LongTaskRepository} repository Store information on the long task progress.
	 * @param {LongTaskRegistry}   processors A list of registered long task processors.
	 */
	new(logger: Logger, backoff: Backoff, settings: LongTaskSettings, processing: LongTaskTracker, repository: LongTaskRepository, processors: LongTaskRegistry): LongTaskManager;
}