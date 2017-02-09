import {LongTask} from "../../../src/Domain/LongTask";
import {LongTaskManager} from "../../../src/Domain/LongTaskManager";
import {LongTaskProcessor} from "../../../src/Domain/LongTaskProcessor";

export class DummyReportGenerator implements LongTaskProcessor {
	execute(task: LongTask, manager: LongTaskManager) {}
}
