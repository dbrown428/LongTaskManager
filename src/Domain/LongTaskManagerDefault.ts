import {Duration} from "../Shared/Values/Duration";
import {LongTaskInfo} from "./LongTaskInfo";
import {LongTaskId} from "./LongTaskId";
import {Logger} from "../Shared/Log/Logger";
import {LongTaskType} from "./LongTaskType";
import {UserId} from "../Shared/Values/UserId";
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

export class LongTaskManagerDefault implements LongTaskApi, LongTaskManager {
	private started: boolean;
	// private taskProcessors: Array <>;

	private name: string;
	// 
	// name of manager.
	constructor(
		private logger: Logger,
		private backoff: Backoff,
		private settings: LongTaskSettings,
		private processing: LongTaskTracker,
		private repository: LongTaskRepository
	) {
		this.started = false;
		this.name = "uniqueNameFromConstructorTODO";
		// this.taskProcessors = 
	}

	public register(type, longTaskInfo: (task: LongTaskInfo) => LongTask): void {
		// key/value.
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

		// redo with Ryan's notes...
		this.logger.info(" = " + this.processing.count() + " tasks with backoff " + this.backoff.delay() + "ms");
		const canProcessCount = this.canProcessorTaskCount();

	    if (canProcessCount > 0) {
	     	this.logger.info("Can process more tasks");
	     	this.process(canProcessCount);	// async. see ryan's notes on await.
	    } else {
			this.logger.info("Cannot process more tasks at this time.");
	     	this.backoff.increase();
	    }


		// review...
	    // Do we want to wait until the task has been added to processing or errors-out before scheduling another run?
	    // this.scheduleProcessTasks();
	}

	private canProcessorTaskCount(): number {
		return this.settings.concurrencyMaximum - this.processing.count();
	}

	private async process(count: number): Promise <void> {
		const claimName = this.name;
		const cleanup = this.settings.cleanupThreshold;
		const nextTasks = await this.repository.claimNextTasks(count, claimName, cleanup);

		if (nextTasks.length < 1) {
			this.backoff.increase();
			return Promise.resolve();
		}

		// add all tasks to the processing dictionary. TODO
		this.processing.add(task.identifier);

		const taskManager = this;
		const key = task.type();
		const processor = this.taskProcessors.processorForKey(key);

		setImmediate((processor, task, taskManager) => {
			// const i:Progress = processor.tick(task);

			if(i.isComplete()) {
				// set complete in repostory
			} else {
				// update repo
			}
		}, processor, task, taskManager);

		return Promise.resolve();
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

		const taskId = await this.repository.create(taskType, params, ownerId, searchKey);
		this.backoff.reset();
		this.scheduleProcessTasks();
		return taskId;
	}

	public async updateTaskProgress(taskId: LongTaskId, progress: LongTaskProgress): Promise <void> {
		try {
			const status = LongTaskStatus.Processing;
			await this.repository.update(taskId, progress, status);
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
