import {Promise} from 'es6-promise';
import {LongTask} from "../../Domain/LongTask";
import {UserId} from "../../Shared/Values/UserId";
import {Option} from "../../Shared/Values/Option";
import {LongTaskId} from "../../Domain/LongTaskId";
import {Duration} from "../../Shared/Values/Duration";
import {LongTaskType} from "../../Domain/LongTaskType";
import {LongTaskClaim} from "../../Domain/LongTaskClaim";
import {LongTaskStatus} from "../../Domain/LongTaskAttributes";
import {LongTaskProgress} from "../../Domain/LongTaskProgress";
import {LongTaskRepository} from "../../Domain/LongTaskRepository";
import {LongTaskParameters} from "../../Domain/LongTaskParameters";

export class LongTaskRepositorySpy implements LongTaskRepository {
	private addCallCount: number;
	private getTasksWithIdsCallCount: number;
	private getNextQueuedTasksCallCount: number;
	private getProcessingTasksCallCount: number;
	private getTasksForSearchKeyCallCount: number;
	private getTasksForUserIdCallCount: number;
	private claimCallCount: number;
	private releaseCallCount: number;
	private updateCallCount: number;
	private cancelCallCount: number;
	private deleteCallCount: number;

	constructor() {
		this.addCallCount = 0;
		this.getTasksWithIdsCallCount = 0;
		this.getNextQueuedTasksCallCount = 0;
		this.getProcessingTasksCallCount = 0;
		this.getTasksForSearchKeyCallCount = 0;
		this.getTasksForUserIdCallCount = 0;
		this.claimCallCount = 0;
		this.releaseCallCount = 0;
		this.updateCallCount = 0;
		this.cancelCallCount = 0;
		this.deleteCallCount = 0;
	}

	public add(type: LongTaskType, params: LongTaskParameters, ownerId: UserId, searchKey: string | Array <string>): Promise <LongTaskId> {
		this.addCallCount += 1;
		const taskId = LongTaskId.withValue("1234567890");			
		return Promise.resolve(taskId);
	}

	public addCount(): number {
		return this.addCallCount;
	}

	public getTasksWithIds(ids: Array <LongTaskId>): Promise <Array <LongTask>> {
		this.getTasksWithIdsCallCount += 1;
		return Promise.resolve([]);
	}

	public getTasksWithIdsCount(): number {
		return this.getTasksWithIdsCallCount;
	}

	public getNextQueuedTasks(count: number): Promise <Array <LongTask>> {
		this.getNextQueuedTasksCallCount += 1;
		return Promise.resolve([]);
	}

	public getNextQueuedTasksCount(): number {
		return this.getNextQueuedTasksCallCount;
	}

	public getProcessingTasksWithClaimOlderThanDurationFromDate(duration: Duration, date: Date): Promise <Array <LongTask>> {
		this.getProcessingTasksCallCount += 1;
		return Promise.resolve([]);
	}

	public getTasksWithIds(ids: Array <LongTaskId>): Promise <Array <LongTask>> {
		this.getTasksWithIdsCallCount += 1;
		return Promise.resolve([]);
	}

	public getTasksForSearchKey(key: string): Promise <Array <LongTask>> {
		this.getTasksForSearchKeyCallCount += 1;
		return Promise.resolve([]);
	}

	public getTasksForUserId(identifier: UserId): Promise <Array <LongTask>> {
		this.getTasksForUserIdCallCount += 1;
		return Promise.resolve([]);
	}

	public claim(taskId: LongTaskId, claim: LongTaskClaim): Promise <boolean> {
		this.claimCallCount += 1;
		return Promise.resolve(true);
	}

	public release(taskId: LongTaskId): Promise <void> {	
		this.releaseCallCount += 1;
		return Promise.resolve();
	}

	public update(taskId: LongTaskId, progress: LongTaskProgress, status: LongTaskStatus): Promise <void> {
		this.updateCallCount += 1;
		return Promise.resolve();
	}

	public cancel(taskId: LongTaskId): Promise <void> {
		this.cancelCallCount += 1;
		return Promise.resolve();
	}

	public delete(taskId: LongTaskId): Promise <void> {
		this.deleteCallCount += 1;
		return Promise.resolve();
	}
}
