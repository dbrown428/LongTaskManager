import {Delay} from "./Delay";
import {LongTask} from "../../src/Domain/LongTask";
import {LongTaskInfo} from "../../src/Domain/LongTaskInfo";
import {Duration} from "../../src/Shared/Values/Duration";
import {LongTaskManager} from "../../src/Domain/LongTaskManager";

export class DelayedResultsLongTask implements LongTask {
	constructor(private duration: Duration) {}

	public async tick(task: LongTaskInfo, manager: LongTaskManager): Promise <void> {
		await Delay.for(this.duration);
		return Promise.resolve();
	}
}
