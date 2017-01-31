import {LongTaskType} from "./LongTaskType";
import {LongTaskProcessor} from "./LongTaskProcessor";

export interface LongTaskProcessorConfiguration {
	key(): LongTaskType;
	default(): LongTaskProcessor;
}
