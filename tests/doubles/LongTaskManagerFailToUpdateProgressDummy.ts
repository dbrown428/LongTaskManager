import {LongTask} from "../../src/Domain/LongTask";
import {UserId} from "../../src/Shared/Values/UserId";
import {LongTaskId} from "../../src/Domain/LongTaskId";
import {LongTaskType} from "../../src/Domain/LongTaskType";
import {LongTaskManager} from "../../src/Domain/LongTaskManager";
import {LongTaskProgress} from "../../src/Domain/LongTaskProgress";
import {LongTaskParameters} from "../../src/Domain/LongTaskParameters";

export class LongTaskManagerFailToUpdateProgressDummy implements LongTaskManager {
	public start(): void {}

	public addTask(taskType: LongTaskType, params: LongTaskParameters, ownerId: UserId, searchKey: string | Array <string>): Promise <LongTaskId> {
		return Promise.resolve(new LongTaskId("123"));
	}

	public updateTaskProgress(taskId: LongTaskId, progress: LongTaskProgress): Promise <void> {
		return Promise.reject("The task was cancelled and cannot be updated.");
	}

	public completedTask(taskId: LongTaskId, progress: LongTaskProgress): Promise <void> {
		return Promise.resolve();
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

	public getTasksForSearchKey(searchKey: string | Array <string>): Promise <Array <LongTask>> {
		return Promise.resolve([]);
	}

	public getTasksForUserId(userId: UserId): Promise <Array <LongTask>> {
		return Promise.resolve([]);
	}
}
