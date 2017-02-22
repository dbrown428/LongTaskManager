import {Duration} from "../../src/Shared/Values/Duration";
import {LongTaskType} from "../../src/Domain/LongTaskType";
import {DelayedResultsProcessor} from "./DelayedResultsProcessor";
import {LongTaskProcessor} from "../../src/Domain/LongTaskProcessor";
import {LongTaskProcessorConfiguration} from "../../src/Domain/LongTaskProcessorConfiguration";

export class DelayedResultsProcessorConfiguration implements LongTaskProcessorConfiguration {
	private duration: Duration;

	constructor() {
		this.duration = Duration.withMilliseconds(100);
	}

	public key(): LongTaskType {
		return LongTaskType.withValue("DelayedResultsProcessor");
	}

	public default(): LongTaskProcessor {
		return new DelayedResultsProcessor(this.duration);
	}

	public setDelay(duration: Duration): void {
		this.duration = duration;
	}
}
