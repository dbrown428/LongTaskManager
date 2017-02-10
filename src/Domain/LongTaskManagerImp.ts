import {LongTask} from "./LongTask";
import {Promise} from 'es6-promise';
import {LongTaskId} from "./LongTaskId";
import {Logger} from "../Shared/Log/Logger";
import {LongTaskType} from "./LongTaskType";
import {LongTaskClaim} from "./LongTaskClaim";
import {UserId} from "../Shared/Values/UserId";
import {Option} from "../Shared/Values/Option";
import {Backoff} from "../Shared/Backoff/Backoff";
import {LongTaskManager} from "./LongTaskManager";
import {LongTaskSettings} from "./LongTaskSettings";
import {LongTaskStatus} from "./LongTaskAttributes";
import {LongTaskProgress} from "./LongTaskProgress";
import {LongTaskProcessor} from "./LongTaskProcessor";
import {LongTaskRepository} from "./LongTaskRepository";
import {LongTaskProcessorConfiguration} from "./LongTaskProcessorConfiguration";

interface Dictionary <T> {
	[K: string]: T;
}

export class LongTaskManagerImp implements LongTaskManager {
	private started: boolean;
	private processing: Array <LongTaskId>;

	// what if this was an injectable dependency?
	private taskProcessors: Dictionary <LongTaskProcessor> = {};

	constructor(
		private backoff: Backoff,
		private config: LongTaskSettings, 
		private repository: LongTaskRepository,
		private logger: Logger
	) {
		this.started = false;
		this.processing = [];	// this could be pluggable... eg. make explicit dependency
	}

	public registerTaskProcessor(configuration: LongTaskProcessorConfiguration): void {
		const key: string = configuration.key().type;
		const processor: LongTaskProcessor = configuration.default();
		this.taskProcessors[key] = processor;
	}

	public getTaskProcessorKeys(): Array <string> {
		return Object.keys(this.taskProcessors);
	}

	public start(): void {
		if (this.started) {
			this.logger.warn("An attempt was made to start an already running long task system.");
		} else {
			this.bootSystem();
		}
	}

	private bootSystem(): void {
		this.started = true;
		this.scheduleCleanup();
		this.processTasks();
		this.logger.info("The long task system has been started.");
	}

	private scheduleCleanup(): void {
		setTimeout(this.cleanup, this.config.cleanupDelay.inMilliseconds());
	}

	// cleanup class…
	private cleanup(): void {
		const duration = this.config.processingTimeMaximum;
		const date = new Date();

		// review...
		this.repository.getProcessingTasksWithClaimOlderThanDurationFromDate(duration, date).then((tasks: Array <LongTask>) => {

			// we could check the type of task...
			// - given history of this task type, it usually takes X time.
			// - release this task, or let it continue running until next cleanup.


			for (let task in tasks) {
				
				// this.repository.release(task.identifier).then((released: boolean) => {

			}
		}).catch((reason) => {
			this.logger.error(reason);
		});

		// Or, should we wait until the cleanup finishes or fails?
		this.scheduleCleanup();
	}

	private processTasks(): void {
	    if (this.canProcessMoreTasks()) {
	        this.tryNextTask()
		        .catch((error) => {
		        	this.logger.error(error);
		        });
	    } else {
	    	this.backoff.increase();
	    }

	    // Do we want to wait until the task has been added to processing or errors-out before scheduling another run?
	    this.scheduleProcessTasks();
	}

	private canProcessMoreTasks(): boolean {
	    return (this.processing.length < this.config.concurrencyMaximum);
	}

	private tryNextTask(): Promise <boolean> {
		return this.repository.getNextTask()
			.then((nextTask: Option <LongTask>) => {
				return this.processNextTaskIfAvailable(nextTask);
			});
	}

	private processNextTaskIfAvailable(nextTask: Option <LongTask>): Promise <boolean> {
		return new Promise((resolve, reject) => {
			if (nextTask.isDefined()) {
				return this.processTask(nextTask.get());
			} else {
				this.noNextTaskToProcess(resolve);
			}
		});
	}

	private noNextTaskToProcess(resolve) {
		this.backoff.increase();
		resolve(false);
	}

	// how can this be tested?
	private processTask(task: LongTask): Promise <boolean> {
		const claimId = LongTaskClaim.withNowTimestamp();

		return Promise.resolve(true);

		// revist... blah
		// return this.repository.claim(task.identifier, claimId)
		// 	.then(() => {
		// 		if (claimed) {
		// 			return false;
		// 			// resolve(false);
		// 		} else {
		// 			const taskManager = this;
		// 			const key = task.attributes.type;
		// 			const processor = this.taskProcessors[key];

		// 			// Execute asyncronously
		// 			setImmediate((processor, task, taskManager) => {
		// 				processor.execute(task, taskManager);
		// 			}, processor, task, taskManager);

		// 			return true;
		// 			//resolve(true);
		// 		}
		// 	})
		// 	.then(() => {
		// 		this.backoff.reset();
		// 		return false;
		// 	});
	}

	private scheduleProcessTasks(): void {
		if (this.started) {
			if (this.backoff.delay() > 0) {
		        setTimeout(this.processTasks, this.backoff.delay());
		    } else {
		        setImmediate(this.processTasks);
		    }
		} else {
			this.logger.warn("The task manager has not been started on this system.");
		}
	}

	public addTask(taskType: LongTaskType, params: string, ownerId: UserId, searchKey: string | Array <string>): Promise <LongTaskId> {
		const type = taskType.type;
		
		return this.repository.add(type, params, ownerId, searchKey)
			.then((taskId: LongTaskId) => {
				this.backoff.reset();
				this.scheduleProcessTasks();
				return taskId;
			});
	}

	// maybe this should be called updateProgress
	// remove the status option...
	public updateTask(taskId: LongTaskId, progress: LongTaskProgress, status: LongTaskStatus): Promise <void> {
		return this.repository.update(taskId, progress, status);
	}

	public completedTask(taskId: LongTaskId, progress: LongTaskProgress): Promise <void> {
		const status = LongTaskStatus.Completed;

		return this.repository.update(taskId, progress, status)
			.then(() => {
				this.removeFromProcessing(taskId);
			});
	}

	private removeFromProcessing(taskId: LongTaskId): void {
	    const index = this.processing.indexOf(taskId);

	    if (index > -1) {
	        this.processing.splice(index, 1);
	    }
	}

	public failedTask(taskId: LongTaskId, progress: LongTaskProgress): Promise <void> {
		const status = LongTaskStatus.Failed;

		return this.repository.update(taskId, progress, status)
			.then(() => {
				this.removeFromProcessing(taskId);
			});
	}

	public cancelTask(taskId: LongTaskId): Promise <void> {
		return this.repository.cancel(taskId)
			.then(() => {
				this.removeFromProcessing(taskId);
			});
	}

	public deleteTask(taskId: LongTaskId): Promise <void> {
		return this.repository.delete(taskId)
			.then(() => {
				this.removeFromProcessing(taskId);
			});
	}

	public getTasksForSearchKey(searchKey: string | Array <string>): Promise <Array <LongTask>> {
		return this.repository.getTasksForSearchKey(searchKey);
	}

	public getTasksForUserId(userId: UserId): Promise <Array <LongTask>> {
		return this.repository.getTasksForUserId(userId);
	}
}
