import {LongTaskRegistry} from "./LongTaskRegistry";
import {LongTaskProcessor} from "./LongTaskProcessor";
import {LongTaskProcessorConfiguration} from "./LongTaskProcessorConfiguration";

interface Dictionary <T> {
	[K: string]: T;
}

export class LongTaskRegistryImp implements LongTaskRegistry {
	private taskProcessors: Dictionary <LongTaskProcessor> = {};

	public keys(): Array <string> {
		return Object.keys(this.taskProcessors);
	}

	public contains(key: string): boolean {
		const processor = this.taskProcessors[key];
		return (processor != null);
	}

	public processorForKey(key: string): LongTaskProcessor {
		const processor = this.taskProcessors[key];

		if (processor == null) {
			throw RangeError("The specified key does not exist.");
		} else {
			return processor;
		}
	}
	
	public add(configuration: LongTaskProcessorConfiguration): void {
		const key: string = configuration.key().type;
		const processor: LongTaskProcessor = configuration.default();
		this.taskProcessors[key] = processor;
	}
}
