import {LongTask} from "./LongTask";
import {LongTaskConfiguration} from "./LongTaskConfiguration";

// THIS IS NO LONGER AN INTERFACE... just concrete implementation.
export interface LongTaskRegistry {
	
	contains(key: string): boolean;

	// this should instantiate a new processor?? If new then we want to include the params too
	longTaskForKey(key: string): LongTask;

	// hold a reference to the configuration.
	register(configuration: LongTaskConfiguration): void;
}
