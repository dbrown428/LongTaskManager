import {Promise} from 'es6-promise';
import {LongTask} from "../../Domain/LongTask";
import {UserId} from "../../Shared/Values/UserId";
import {Option} from "../../Shared/Values/Option";
import {LongTaskId} from "../../Domain/LongTaskId";
import {Duration} from "../../Shared/Values/Duration";
import {LongTaskClaim} from "../../Domain/LongTaskClaim";
import {LongTaskStatus} from "../../Domain/LongTaskAttributes";
import {LongTaskProgress} from "../../Domain/LongTaskProgress";
import {LongTaskRepository} from "../../Domain/LongTaskRepository";

export class LongTaskRepositorySpy implements LongTaskRepository {
	private addCallCount: number;
	private getNextTaskCallCount: number;
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
		this.getNextTaskCallCount = 0;
		this.getProcessingTasksCallCount = 0;
		this.getTasksForSearchKeyCallCount = 0;
		this.getTasksForUserIdCallCount = 0;
		this.claimCallCount = 0;
		this.releaseCallCount = 0;
		this.updateCallCount = 0;
		this.cancelCallCount = 0;
		this.deleteCallCount = 0;
	}

	public add(type: string, params: string, ownerId: UserId, searchKey: string | Array <string>): Promise <LongTaskId> {
		return new Promise((resolve, reject) => {
			this.addCallCount += 1;
			const taskId = new LongTaskId("1234567890");
			resolve(taskId);
		});
	}

	public addCount(): number {
		return this.addCallCount;
	}

	public getNextTask(): Promise <Option <LongTask>> {
		return new Promise((resolve, reject) => {
			this.getNextTaskCallCount += 1;
			resolve(Option.none());
		});
	}

	public getNextTaskCount(): number {
		return this.getNextTaskCallCount;
	}

	public getProcessingTasksWithClaimOlderThanDurationFromDate(duration: Duration, date: Date): Promise <Array <LongTask>> {
		return new Promise((resolve, reject) => {
			this.getProcessingTasksCallCount += 1;
			resolve([]);
		});
	}

	public getTasksForSearchKey(key: string): Promise <Array <LongTask>> {
		return new Promise((resolve, reject) => {
			this.getTasksForSearchKeyCallCount += 1;
			resolve([]);
		});
	}

	public getTasksForUserId(identifier: UserId): Promise <Array <LongTask>> {
		return new Promise((resolve, reject) => {
			this.getTasksForUserIdCallCount += 1;
			resolve([]);
		});
	}

	public claim(taskId: LongTaskId, claim: LongTaskClaim): Promise <boolean> {
		return new Promise((resolve, reject) => {
			this.claimCallCount += 1;
			resolve(true);
		});
	}

	public release(taskId: LongTaskId): Promise <boolean> {
		return new Promise((resolve, reject) => {
			this.releaseCallCount += 1;
			resolve(true);
		});
	}

	public update(taskId: LongTaskId, progress: LongTaskProgress, status: LongTaskStatus): Promise <boolean> {
		return new Promise((resolve, reject) => {
			this.updateCallCount += 1;
			resolve(true);
		});
	}

	public cancel(taskId: LongTaskId): Promise <boolean> {
		return new Promise((resolve, reject) => {
			this.cancelCallCount += 1;
			resolve(true);
		});
	}

	public delete(taskId: LongTaskId): Promise <boolean> {
		return new Promise((resolve, reject) => {
			this.deleteCallCount += 1;
			resolve(true);
		});
	}
}
