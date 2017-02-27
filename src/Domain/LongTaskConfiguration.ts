import {LongTaskType} from "./LongTaskType";
import {LongTask} from "./LongTask";

export interface LongTaskConfiguration {
	key(): LongTaskType;
	default(): LongTask;
}
