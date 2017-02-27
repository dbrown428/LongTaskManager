import {UserId} from "../src/Shared/Values/UserId";
import {LongTaskId} from "../src/Domain/LongTaskId";

// consider moving...
import {DownloadMediaLongTaskParameters} from "../doubles/DownloadMediaLongTaskParameters";

class DownloadMediaLongTaskRequest {
	constructor(private manager: LongTaskManager) {}

	public async request(urls: Array <string>, ownerId: UserId): Promise <LongTaskId> {
		const config = new DownloadMediaLongTaskConfiguration;
		const taskType = config.key();
		const searchKey: string = ownerId.value;
		const params = DownloadMediaLongTaskParameters.withItems(urls);
		const taskId = await manager.createTask(taskType, params, ownerId, searchKey);

		return taskId;
	}
}
