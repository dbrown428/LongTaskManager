import {LongTask} from "../../src/Domain/LongTask";
import {LongTaskManager} from "../../src/Domain/LongTaskManager";
import {LongTaskProcessor} from "../../src/Domain/LongTaskProcessor";

export class DownloadMediaProcessor implements LongTaskProcessor {
	execute(task: LongTask, manager: LongTaskManager) {
		// do several items at a time: batch of 3? steps: 3
		// actually download the content.
		// report status back to the long task manager.
	}
}
