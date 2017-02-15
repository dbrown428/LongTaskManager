import {LongTaskProcessor} from "./LongTaskProcessor";
import {LongTaskProcessorConfiguration} from "./LongTaskProcessorConfiguration";

export interface LongTaskRegistry {
	keys(): Array <string>;
	contains(key: string): boolean;
	processorForKey(key: string): LongTaskProcessor;
	add(configuration: LongTaskProcessorConfiguration): void;
}
