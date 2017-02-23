import {Delayable} from "./Delayable";
import {LongTask} from "../../src/Domain/LongTask";
import {Duration} from "../../src/Shared/Values/Duration";
import {LongTaskManager} from "../../src/Domain/LongTaskManager";
import {LongTaskProcessor} from "../../src/Domain/LongTaskProcessor";

export class DelayedResultsProcessor implements LongTaskProcessor {
	constructor(private duration: Duration) {}

	public async tick(task: LongTask, manager: LongTaskManager): Promise <void> {
		await Delayable.delay(this.duration);
		return Promise.resolve();
	}
}
