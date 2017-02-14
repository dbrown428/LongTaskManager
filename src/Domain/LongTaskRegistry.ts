import {LongTaskProcessor} from "./LongTaskProcessor";
import {LongTaskProcessorConfiguration} from "./LongTaskProcessorConfiguration";

export interface LongTaskRegistry {
	keys(): Array <string>;
	processorForKey(key: string): LongTaskProcessor;
	add(configuration: LongTaskProcessorConfiguration): void;
}
