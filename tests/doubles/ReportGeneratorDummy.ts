import {LongTask} from "../../src/Domain/LongTask";
import {LongTaskManager} from "../../src/Domain/LongTaskManager";
import {LongTaskProcessor} from "../../src/Domain/LongTaskProcessor";

export class ReportGeneratorDummy implements LongTaskProcessor {

	// set the artifical processing delay for this...

	public tick(task: LongTask, manager: LongTaskManager): Promise <void> {

		// delay.

		return Promise.resolve();
	}
}
