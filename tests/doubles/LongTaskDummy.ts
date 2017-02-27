import {LongTask} from "../../src/Domain/LongTask";
import {LongTaskManager} from "../../src/Domain/LongTaskManager";
import {LongTaskInfo} from "../../src/Domain/LongTaskInfo";

export class LongTaskDummy implements LongTask {
	public tick(task: LongTaskInfo, manager: LongTaskManager): Promise <void> {
		return Promise.resolve();
	}
}
