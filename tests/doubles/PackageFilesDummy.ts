import {LongTask} from "../../src/Domain/LongTask";
import {LongTaskManager} from "../../src/Domain/LongTaskManager";
import {LongTaskProcessor} from "../../src/Domain/LongTaskProcessor";

export class PackageFilesDummy implements LongTaskProcessor {
	execute(task: LongTask, manager: LongTaskManager) {}
}
