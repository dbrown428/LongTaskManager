import {LongTaskId} from "../../src/Domain/LongTaskId";
import {LongTaskManager} from "../../src/Domain/LongTaskManager";

export class LongTaskManagerSpy implements LongTaskmanager {
	// call counts.
	// todo

	start(): void {}

	addTask(taskType: LongTaskType, params: LongTaskParameters, ownerId: UserId, searchKey: string | Array <string>): Promise <LongTaskId> {
		return Promise.resolve(new LongTaskId("123"));
	}

	updateTaskProgress(taskId: LongTaskId, progress: LongTaskProgress): Promise <void> {
		return Promise.resolve();
	}

	completedTask(taskId: LongTaskId, progress: LongTaskProgress): Promise <void> {
		return Promise.resolve();
	}
	
	failedTask(taskId: LongTaskId, progress: LongTaskProgress): Promise <void> {
		return Promise.resolve();
	}

	cancelTask(taskId: LongTaskId): Promise <void> {
		return Promise.resolve();
	}

	deleteTask(taskId: LongTaskId): Promise <void> {
		return Promise.resolve();
	}

	getTasksForSearchKey(searchKey: string | Array <string>): Promise <Array <LongTask>> {
		return Promise.resolve([]);
	}

	getTasksForUserId(userId: UserId): Promise <Array <LongTask>> {
		return Promise.resolve([]);
	}
}
