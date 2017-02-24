import {LongTaskProcessor} from "./LongTaskProcessor";
import {LongTaskProcessorConfiguration} from "./LongTaskProcessorConfiguration";

// THIS IS NO LONGER AN INTERFACE... just concrete implementation.
export interface LongTaskRegistry {
	keys(): Array <string>;	// review ... are keys() and contains() both needed
	contains(key: string): boolean;	// review
	processorForKey(key: string): LongTaskProcessor;	// this should instantiate a new processor.
	register(configuration: LongTaskProcessorConfiguration): void;	// hold a reference to the configuration.
}
