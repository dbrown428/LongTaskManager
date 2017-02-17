import {LongTask} from "../../src/Domain/LongTask";
import {UserId} from "../../src/Shared/Values/UserId";
import {LongTaskId} from "../../src/Domain/LongTaskId";
import {LongTaskType} from "../../src/Domain/LongTaskType";
import {LongTaskManager} from "../../src/Domain/LongTaskManager";
import {LongTaskProgress} from "../../src/Domain/LongTaskProgress";
import {LongTaskParameters} from "../../src/Domain/LongTaskParameters";

export class LongTaskManagerSpy implements LongTaskManager {
	private startCallCount: number;
	private addTaskCallCount: number;
	private updateTaskProgressCallCount: number;
	private completedTaskCallCount: number;
	private failedTaskCallCount: number;
	private cancelTaskCallCount: number;
	private deleteTaskCallCount: number;
	private getTasksForSearchKeyCallCount: number;
	private getTasksForUserIdCallCount: number;

	constructor() {
		this.startCallCount = 0;
		this.addTaskCallCount = 0;
		this.updateTaskProgressCallCount = 0;
		this.completedTaskCallCount = 0;
		this.failedTaskCallCount = 0;
		this.cancelTaskCallCount = 0;
		this.deleteTaskCallCount = 0;
		this.getTasksForSearchKeyCallCount = 0;
		this.getTasksForUserIdCallCount = 0;
	}

	public start(): void {
		this.startCallCount +=1;
	}

	public startCount(): number {
		return this.startCallCount;
	}

	public addTask(taskType: LongTaskType, params: LongTaskParameters, ownerId: UserId, searchKey: string | Array <string>): Promise <LongTaskId> {
		this.addTaskCallCount += 1;
		return Promise.resolve(new LongTaskId("123"));
	}

	public addTaskCount(): number {
		return this.addTaskCallCount;
	}

	public updateTaskProgress(taskId: LongTaskId, progress: LongTaskProgress): Promise <void> {
		this.updateTaskProgressCallCount += 1;
		return Promise.resolve();
	}

	public updateTaskProgressCount(): number {
		return this.updateTaskProgressCallCount;
	}

	public completedTask(taskId: LongTaskId, progress: LongTaskProgress): Promise <void> {
		this.completedTaskCallCount += 1;
		return Promise.resolve();
	}

	public completedTaskCount(): number {
		return this.completedTaskCallCount;
	}
	
	public failedTask(taskId: LongTaskId, progress: LongTaskProgress): Promise <void> {
		this.failedTaskCallCount += 1;
		return Promise.resolve();
	}

	public failedTaskCount(): number {
		return this.failedTaskCallCount;
	}

	public cancelTask(taskId: LongTaskId): Promise <void> {
		this.cancelTaskCallCount += 1;
		return Promise.resolve();
	}

	public cancelTaskCount(): number {
		return this.cancelTaskCallCount;
	}

	public deleteTask(taskId: LongTaskId): Promise <void> {
		this.deleteTaskCallCount += 1;
		return Promise.resolve();
	}

	public deleteTaskCount(): number {
		return this.deleteTaskCallCount;
	}

	public getTasksForSearchKey(searchKey: string | Array <string>): Promise <Array <LongTask>> {
		this.getTasksForSearchKeyCallCount += 1;
		return Promise.resolve([]);
	}

	public getTasksForSearchKeyCount(): number {
		return this.getTasksForSearchKeyCallCount;
	}

	public getTasksForUserId(userId: UserId): Promise <Array <LongTask>> {
		this.getTasksForUserIdCallCount += 1;
		return Promise.resolve([]);
	}

	public getTasksForUserIdCount(): number {
		return this.getTasksForUserIdCallCount;
	}
}
