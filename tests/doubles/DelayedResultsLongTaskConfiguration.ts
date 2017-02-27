import {Duration} from "../../src/Shared/Values/Duration";
import {LongTaskType} from "../../src/Domain/LongTaskType";
import {DelayedResultsLongTask} from "./DelayedResultsLongTask";
import {LongTask} from "../../src/Domain/LongTask";
import {LongTaskConfiguration} from "../../src/Domain/LongTaskConfiguration";

export class DelayedResultsLongTaskConfiguration implements LongTaskConfiguration {
	readonly duration: Duration;

	constructor(value?: Duration) {
		if (value) {
			this.duration = value;
		} else {
			this.duration = Duration.withMilliseconds(100);
		}
	}

	public key(): LongTaskType {
		return LongTaskType.withValue("DelayedResultsLongTask");
	}

	public default(): LongTask {
		return new DelayedResultsLongTask(this.duration);
	}
}
