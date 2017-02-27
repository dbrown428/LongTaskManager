import {assert} from "chai";
import {LongTaskInfo} from "../../src/Domain/LongTaskInfo";
import {UserId} from "../../src/Shared/Values/UserId";
import {LongTaskId} from "../../src/Domain/LongTaskId";
import {LongTaskType} from "../../src/Domain/LongTaskType";
import {LongTaskManager} from "../../src/Domain/LongTaskManager";
import {LongTaskProgress} from "../../src/Domain/LongTaskProgress";
import {LongTaskParameters} from "../../src/Domain/LongTaskParameters";

export class LongTaskManagerMock implements LongTaskManager {
	private expectingCompletedTaskProgress: LongTaskProgress;
	private shouldFailCompletedTask: boolean;

	constructor() {
		this.shouldFailCompletedTask = false;
	}

	public start(): void {}

	public createTask(taskType: LongTaskType, params: LongTaskParameters, ownerId: UserId, searchKey: string | Array <string>): Promise <LongTaskId> {
		return Promise.resolve(LongTaskId.withValue("123"));
	}

	public updateTaskProgress(taskId: LongTaskId, progress: LongTaskProgress): Promise <void> {
		return Promise.resolve();
	}

	public completedTask(taskId: LongTaskId, progress: LongTaskProgress): Promise <void> {
		if (this.expectingCompletedTaskProgress) {
			assert.equal(progress.state, this.expectingCompletedTaskProgress.state);
			assert.equal(progress.currentStep, this.expectingCompletedTaskProgress.currentStep);
			assert.equal(progress.maximumSteps, this.expectingCompletedTaskProgress.maximumSteps);
		}

		assert.isFalse(this.shouldFailCompletedTask);
		return Promise.resolve();
	}

	public expectingCompletedTaskProgressToEqual(progress: LongTaskProgress): void {
		this.expectingCompletedTaskProgress = progress;
	}

	public setCompletedTaskToFail(flag: boolean) {
		this.shouldFailCompletedTask = flag;
	}

	public failedTask(taskId: LongTaskId, progress: LongTaskProgress): Promise <void> {
		return Promise.resolve();
	}

	public cancelTask(taskId: LongTaskId): Promise <void> {
		return Promise.resolve();
	}

	public deleteTask(taskId: LongTaskId): Promise <void> {
		return Promise.resolve();
	}

	public getTasksCurrentlyProcessing(): Promise <Array <LongTaskInfo>> {
		return Promise.resolve([]);
	}

	public getTasksForSearchKey(searchKey: string | Array <string>): Promise <Array <LongTaskInfo>> {
		return Promise.resolve([]);
	}

	public getTasksForUserId(userId: UserId): Promise <Array <LongTaskInfo>> {
		return Promise.resolve([]);
	}
}
