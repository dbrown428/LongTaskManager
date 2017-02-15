import {LongTask} from "./LongTask";
import {Promise} from 'es6-promise';
import {LongTaskId} from "./LongTaskId";
import {Logger} from "../Shared/Log/Logger";
import {LongTaskType} from "./LongTaskType";
import {LongTaskClaim} from "./LongTaskClaim";
import {UserId} from "../Shared/Values/UserId";
import {Option} from "../Shared/Values/Option";
import {LongTaskTracker} from "./LongTaskTracker";
import {Backoff} from "../Shared/Backoff/Backoff";
import {LongTaskManager} from "./LongTaskManager";
import {LongTaskRegistry} from "./LongTaskRegistry";
import {LongTaskSettings} from "./LongTaskSettings";
import {LongTaskStatus} from "./LongTaskAttributes";
import {LongTaskProgress} from "./LongTaskProgress";
import {LongTaskProcessor} from "./LongTaskProcessor";
import {LongTaskRepository} from "./LongTaskRepository";
import {LongTaskProcessorConfiguration} from "./LongTaskProcessorConfiguration";

export class LongTaskManagerImp implements LongTaskManager {
	private started: boolean;

	constructor(
		private logger: Logger,
		private backoff: Backoff,
		private config: LongTaskSettings,
		private processing: LongTaskTracker,
		private repository: LongTaskRepository,
		private taskProcessors: LongTaskRegistry
	) {
		this.started = false;
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
		// based on ryan's suggestions this could be changed to retrieve all tasks at once...
		// then run through all and wait for the promises to complete.
		
		// 1. retrieve all queued tasks (say up to 1000)
		// 2. await each?
		// 3. 

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
	    return (this.processing.count() < this.config.concurrencyMaximum);
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

	private processTask(task: LongTask): Promise <boolean> {
		const claimId = LongTaskClaim.withNowTimestamp();

		// temp
		return Promise.resolve(false);

		// return this.repository.claim(task.identifier, claimId)
		// 	.then(() => {
		// 		if (claimed) {
		// 			return false;
		// 			// resolve(false);
		// 		} else {
					// this.processing.add(task.identifier);

		// 			const taskManager = this;
		// 			const key = task.attributes.type;
		// 			const processor = this.taskProcessors.processorForKey(key);

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
				// review...
				// this should really check if an existing timer has been set already.
				// TODO
		        const timeoutHandle = setTimeout(this.processTasks, this.backoff.delay());
		    } else {
		        setImmediate(this.processTasks);
		    }
		} else {
			this.logger.warn("The task manager has not been started on this system.");
		}
	}

	// this validation can/could/should also be done on the layer above... TODO
	public addTask(taskType: LongTaskType, params: string, ownerId: UserId, searchKey: string | Array <string>): Promise <LongTaskId> {
		const type = taskType.type;

		if (this.taskProcessors.contains(type)) {
			return this.repository.add(type, params, ownerId, searchKey)
				.then((taskId: LongTaskId) => {
					this.backoff.reset();
					this.scheduleProcessTasks();
					return taskId;
				});
		} else {
			throw TypeError("The specified long task type is not registered with the system.");
		}
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
				this.processing.remove(taskId);
			});
	}

	public failedTask(taskId: LongTaskId, progress: LongTaskProgress): Promise <void> {
		const status = LongTaskStatus.Failed;

		return this.repository.update(taskId, progress, status)
			.then(() => {
				this.processing.remove(taskId);
			});
	}

	public cancelTask(taskId: LongTaskId): Promise <void> {
		return this.repository.cancel(taskId)
			.then(() => {
				this.processing.remove(taskId);
			});
	}

	public deleteTask(taskId: LongTaskId): Promise <void> {
		return this.repository.delete(taskId)
			.then(() => {
				this.processing.remove(taskId);
			});
	}

	public getTasksForSearchKey(searchKey: string | Array <string>): Promise <Array <LongTask>> {
		return this.repository.getTasksForSearchKey(searchKey);
	}

	public getTasksForUserId(userId: UserId): Promise <Array <LongTask>> {
		return this.repository.getTasksForUserId(userId);
	}
}
