import {LongTaskRegistry} from "./LongTaskRegistry";
import {LongTaskProcessor} from "./LongTaskProcessor";
import {LongTaskProcessorConfiguration} from "./LongTaskProcessorConfiguration";
import {LongTaskRegistryDuplicateKeyException} from "./LongTaskRegistryDuplicateKeyException";
import {LongTaskRegistryDuplicateProcessorException} from "./LongTaskRegistryDuplicateProcessorException";

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
		const key: string = configuration.key().value;
		const processor: LongTaskProcessor = configuration.default();

		if (this.contains(key)) {
			throw new LongTaskRegistryDuplicateKeyException("Each key must be unique.");
		} else if (this.hasProcessor(processor)) {
			throw new LongTaskRegistryDuplicateProcessorException("Each processor must be unique.");
		}

		this.taskProcessors[key] = processor;
	}

	private hasProcessor(processor: LongTaskProcessor): boolean {
		for (var i in this.taskProcessors) {
			const existingTaskProcessor = this.taskProcessors[i];

			if (processor.constructor.name == existingTaskProcessor.constructor.name) {
				return true;
			}
		}
		
		return false;
	}
}
