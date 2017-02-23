import {LongTask} from "./LongTask";
import {LongTaskId} from "./LongTaskId";
import {Logger} from "../Shared/Log/Logger";
import {LongTaskType} from "./LongTaskType";
import {LongTaskClaim} from "./LongTaskClaim";
import {UserId} from "../Shared/Values/UserId";
import {LongTaskTracker} from "./LongTaskTracker";
import {Backoff} from "../Shared/Backoff/Backoff";
import {LongTaskManager} from "./LongTaskManager";
import {LongTaskRegistry} from "./LongTaskRegistry";
import {LongTaskSettings} from "./LongTaskSettings";
import {LongTaskStatus} from "./LongTaskAttributes";
import {LongTaskProgress} from "./LongTaskProgress";
import {LongTaskProcessor} from "./LongTaskProcessor";
import {LongTaskRepository} from "./LongTaskRepository";
import {LongTaskParameters} from "./LongTaskParameters";
import {LongTaskProcessorConfiguration} from "./LongTaskProcessorConfiguration";
import {LongTaskTypeUnregisteredException} from "./LongTaskTypeUnregisteredException";

export class LongTaskManagerImp implements LongTaskManager {
	private started: boolean;

	constructor(
		private logger: Logger,
		private backoff: Backoff,
		private settings: LongTaskSettings,
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
		// this.scheduleCleanup();
		this.processTasks();
		this.logger.info("The long task system has been started.");
	}

	private scheduleCleanup(): void {
		setTimeout(() => this.cleanup(), this.settings.cleanupDelay.inMilliseconds());
	}

	private cleanup(): void {
		const duration = this.settings.processingTimeMaximum;
		const date = new Date();

		// REDO...
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
		this.logger.info(" = " + this.processing.count() + " tasks with backoff " + this.backoff.delay() + "ms");
		
	    if (this.canProcessMoreTasks()) {
	     	this.logger.info("Can process more tasks");
	 		// process as many as concurrency spaces available. TODO
	     	this.processNextTask();
	    } else {
	     	this.backoff.increase();
	    }

	    // Do we want to wait until the task has been added to processing or errors-out before scheduling another run?
	    this.scheduleProcessTasks();
	}

	private canProcessMoreTasks(): boolean {
	    return (this.processing.count() < this.settings.concurrencyMaximum);
	}

	private async processNextTask(): Promise <void> {
		// change this to many... temp
		const nextTasks = await this.repository.getNextQueuedTasks(1);

		// TEMP -  update to multiple... incorporate the concurrency limit and currently processing. TODO
		if (nextTasks.length > 0) {
			await this.process(nextTasks[0]);
		} else {
			this.backoff.increase();
		}

		return Promise.resolve();
	}

	private async process(task: LongTask): Promise <void> {
		this.logger.info(" + Attempting to claim task (" + task.identifier.value + ")");
		const claimId = LongTaskClaim.withNowTimestamp();
		const claimed = await this.repository.claim(task.identifier, claimId);
		
		if ( ! claimed)	{
			this.logger.info("The task (" + task.identifier.value + ") was already claimed.");
			return;
		}

		this.processing.add(task.identifier);

		const taskManager = this;
		const key = task.type();
		const processor = this.taskProcessors.processorForKey(key);

		setImmediate((processor, task, taskManager) => {
			processor.tick(task, taskManager);
		}, processor, task, taskManager);
	}

	private scheduleProcessTasks(): void {
		if (this.started) {
			if (this.backoff.delay() > 0) {
				// review...
				// this should really check if an existing timer has been set already.
				// TODO
		        const timeoutHandle = setTimeout(() => this.processTasks(), this.backoff.delay());
		    } else {
		        setImmediate(() => this.processTasks());
		    }
		} else {
			this.logger.warn("The task manager has not been started on this system.");
		}
	}

	public async addTask(taskType: LongTaskType, params: LongTaskParameters, ownerId: UserId, searchKey: string | Array <string>): Promise <LongTaskId> {
		if ( ! this.taskProcessors.contains(taskType.value)) {
			throw new LongTaskTypeUnregisteredException("The specified long task type (" + taskType.value + ") is not registered with the system.");
		}

		const taskId = await this.repository.add(taskType, params, ownerId, searchKey);
		this.backoff.reset();
		this.scheduleProcessTasks();
		return taskId;
	}

	public async updateTaskProgress(taskId: LongTaskId, progress: LongTaskProgress): Promise <void> {
		try {
			// we release each task after an update, so other tasks can work.
			const status = LongTaskStatus.Queued;
			await this.repository.update(taskId, progress, status);
			await this.repository.release(taskId);	// ^^^ perhaps expand the update method to include a claim field ??
			this.processing.remove(taskId);
		} catch (error) {
			this.processing.remove(taskId);
			throw error;
		}
	}

	public async completedTask(taskId: LongTaskId, progress: LongTaskProgress): Promise <void> {
		const status = LongTaskStatus.Completed;
		await this.repository.update(taskId, progress, status)
		this.processing.remove(taskId);
	}

	public async failedTask(taskId: LongTaskId, progress: LongTaskProgress): Promise <void> {
		const status = LongTaskStatus.Failed;
		await this.repository.update(taskId, progress, status)	
		this.processing.remove(taskId);
	}

	public async cancelTask(taskId: LongTaskId): Promise <void> {
		await this.repository.cancel(taskId);
		this.processing.remove(taskId);
	}

	public async deleteTask(taskId: LongTaskId): Promise <void> {
		await this.repository.delete(taskId)
		this.processing.remove(taskId);
	}

	public async getTasksCurrentlyProcessing(): Promise <Array <LongTask>> {
		const taskIds = this.processing.list();
		const tasks = await this.repository.getTasksWithIds(taskIds);
		return tasks;
	}

	public getTasksForSearchKey(searchKey: string | Array <string>): Promise <Array <LongTask>> {
		return this.repository.getTasksForSearchKey(searchKey);
	}

	public getTasksForUserId(userId: UserId): Promise <Array <LongTask>> {
		return this.repository.getTasksForUserId(userId);
	}
}
