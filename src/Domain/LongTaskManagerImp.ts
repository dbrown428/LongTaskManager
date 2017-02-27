import {LongTaskInfo} from "./LongTaskInfo";
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
import {LongTask} from "./LongTask";
import {LongTaskRepository} from "./LongTaskRepository";
import {LongTaskParameters} from "./LongTaskParameters";
import {LongTaskConfiguration} from "./LongTaskConfiguration";
import {LongTaskTypeUnregisteredException} from "./LongTaskTypeUnregisteredException";

// LongTaskManagerDefault
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
		this.processTasks();
		this.logger.info("The long task system has been started.");
	}

	private processTasks(): void {
		this.logger.info(" = " + this.processing.count() + " tasks with backoff " + this.backoff.delay() + "ms");
		
	    if (this.canProcessMoreTasks()) {
	     	this.logger.info("Can process more tasks");
	 		// process as many as concurrency spaces available.
	 		// TODO
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

	private async process(task: LongTaskInfo): Promise <void> {
		this.logger.info(" + Attempting to claim task (" + task.identifier.value + ")");
		const claimId = LongTaskClaim.withNowTimestamp();

		// redo this... the claim is built into the "claimNextTasks";
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
			const i:Progress = processor.tick(task);

			if(i.isComplete()) {
				// set complete in repostory
			} else {
				// update repo
			}
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

	public async createTask(taskType: LongTaskType, params: LongTaskParameters, ownerId: UserId, searchKey: string | Array <string>): Promise <LongTaskId> {
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

	public async getTasksCurrentlyProcessing(): Promise <Array <LongTaskInfo>> {
		const taskIds = this.processing.list();
		const tasks = await this.repository.getTasksWithIds(taskIds);
		return tasks;
	}

	public getTasksForSearchKey(searchKey: string | Array <string>): Promise <Array <LongTaskInfo>> {
		return this.repository.getTasksForSearchKey(searchKey);
	}

	public getTasksForUserId(userId: UserId): Promise <Array <LongTaskInfo>> {
		return this.repository.getTasksForUserId(userId);
	}
}
