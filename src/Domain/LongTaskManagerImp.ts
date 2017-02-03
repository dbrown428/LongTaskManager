import {LongTask} from "./LongTask";
import {Promise} from 'es6-promise';
import {LongTaskId} from "./LongTaskId";
import {Logger} from "../Shared/Log/Logger";
import {LongTaskType} from "./LongTaskType";
import {LongTaskClaim} from "./LongTaskClaim";
import {UserId} from "../Shared/Values/UserId";
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
	private taskProcessors: Dictionary <LongTaskProcessor> = {};

	constructor(
		private backoff: Backoff,
		private config: LongTaskSettings, 
		private repository: LongTaskRepository,
		private logger: Logger
	) {
		this.started = false;
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

	private cleanup(): void {
		const duration = this.config.processingTimeMaximum;
		this.repository.getProcessingTasksWithClaimIdOlderThanDuration(duration).then((tasks: Array <LongTask>) => {

			// we could check the type of task...
			// - given history of this task type, it usually takes X time.
			// - release this task, or let it continue running until next cleanup.

			for (let task in tasks) {
				
				// this.repository.release(task.identifier).then((released: boolean) => {

				// });

			}
		}).catch((reason) => {
			// log reason.
		});

		// Or, should we wait until the cleanup finishes or fails?
		this.scheduleCleanup();
	}

	private processTasks(): void {
	    if (this.canProcessMoreTasks()) {
	        this.tryNextTask().then(() => {
	        	this.scheduleProcessTasks();
	        }).catch((error) => {
	        	// log the error.
	            // if error, potentially schedule a retry? depends on error. connection? db? job internal?
	            this.scheduleProcessTasks();
	        });
	    }

	    // this.scheduleProcessTasks();
	}

	private canProcessMoreTasks(): boolean {
	    return (this.processing.length < this.config.concurrencyMaximum);
	}

	private tryNextTask(): Promise <boolean> {
		return new Promise((resolve, reject) => {
			this.repository.getNextTask().then((nextTask: LongTask) => {
				if (nextTask.isDefined()) {
					this.processTask(nextTask.get()).then(() => {
						this.backoff.reset();
					});
				} else {
					this.backoff.increase();
				}
			});
		});
	}

	private processTask(task: LongTask): void {
		const claimId = LongTaskClaim.withNowTimestamp();

		this.repository.claim(task.identifier, claimId).then((claimed: boolean) => {
			if ( ! claimed) {
				const taskManager = this;
				const key = task.attributes.type;
				const processor = this.taskProcessors[key];

				// Execute asyncronously
				setImmediate((processor, task, taskManager) => {
					processor.execute(task, taskManager);
				}, processor, task, taskManager);
			}
		});
	}

	private scheduleProcessTasks(): void {
		if (this.started) {
			if (this.backoff.delay() > 0) {
		        setTimeout(this.processTasks, this.backoff.delay());
		    } else {
		        setImmediate(this.processTasks);
		    }
		} else {
			// log... the task manager has not been started on this system.
			// this could be called by an "add" or something else that wants the system to start.
		}
	}

	public addTask(taskType: LongTaskType, params: string, ownerId: UserId, searchKey: string | Array <string>): Promise <LongTaskId> {
		return new Promise((resolve, reject) => {
			const type = taskType.value;
			
			this.repository.add(type, params, ownerId, searchKey).then((taskId: LongTaskId) => {
				this.backoff.reset();
				this.scheduleProcessTasks();
				resolve(taskId);
			});
		});
	}

	public updateTask(taskId: LongTaskId, progress: LongTaskProgress): Promise <boolean> {
		return new Promise((resolve, reject) => {
			// just a forwarding call... nothing to test. hmmm...
			repository.update(taskId, progress).then((updated: boolean) => {
				if (updated) {
					// ?
					resolve(true)
				} else {
					resolve(false);
				}
			});
		});
	}

	public completedTask(taskId: LongTaskId, progress: LongTaskProgress): Promise <boolean> {
		
			const status = LongTaskStatus.Completed;

			return this.repository.update(taskId, progress, status).then((successful: boolean) => {
				if (successful) {
					this.removeFromProcessing(taskId);
					return true;
				} else {
					return false;
				}
			});

			// .catch((error) => {
			// 	// log error.
			// 	// or should this bubble up to the next layer?
			// 	resolve(false);
			// });
		
	}

	private removeFromProcessing(taskId: LongTaskId): void {
	    const index = this.processing.indexOf(taskId);

	    if (index > -1) {
	        this.processing.splice(index, 1);
	    }
	}

	public failedTask(taskId: LongTaskId, progress: LongTaskProgress): Promise <boolean> {
		return new Promise((resolve, reject) => {
			// remove from processing.
			// log
			// TODO
			resolve(false);
		});
	}

	public cancelTask(taskId: LongTaskId): Promise <boolean> {
		return new Promise((resolve, reject) => {

			// if it's processing... remove it
			// TODO
			resolve(false);
		});
	}

	public deleteTask(taskId: LongTaskId): Promise <boolean> {
		return new Promise((resolve, reject) => {
			// if it's processing... remove it
			// TODO
			resolve(false);
		});
	}

	public getTasksForSearchKey(searchKey: string | Array <string>): Promise <Array <LongTask>> {
		return new Promise((resolve, reject) => {

			// TODO
			resolve([]);
		});
	}

	public getTasksForUserId(userId: UserId): Promise <Array <LongTask>> {
		return new Promise((resolve, reject) => {

			// TODO
			resolve([]);
		});
	}
}
