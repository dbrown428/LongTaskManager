import {LongTaskRegistry} from "./LongTaskRegistry";
import {LongTask} from "./LongTask";
import {LongTaskConfiguration} from "./LongTaskConfiguration";
import {LongTaskRegistryDuplicateKeyException} from "./LongTaskRegistryDuplicateKeyException";
import {LongTaskRegistryDuplicateProcessorException} from "./LongTaskRegistryDuplicateProcessorException";

interface DictionaryEntry <T> {
	[K: string]: T;
}

// Remove.
export class LongTaskRegistryImp implements LongTaskRegistry {
	private tasks: Dictionary <LongTask> = {};

	public contains(key: string): boolean {
		const task = this.tasks[key];
		return (task != null);
	}

	public longTaskForKey(key: string): LongTask {
		const task = this.tasks[key];

		if (task == null) {
			throw RangeError("The specified key does not exist.");
		} else {
			return task;
		}
	}
	
	// public add(key, factory)
	public add(configuration: LongTaskConfiguration): void {
		const key: string = configuration.key().value;
		const task: LongTask = configuration.default();

		if (this.contains(key)) {
			throw new LongTaskRegistryDuplicateKeyException("Each key must be unique.");
		} else if (this.has(task)) {
			throw new LongTaskRegistryDuplicateProcessorException("Each task must be unique.");
		}

		this.tasks[key] = task;
	}

	private has(task: LongTask): boolean {
		for (var i in this.tasks) {
			const existingTask = this.tasks[i];

			if (task.constructor.name == existingTask.constructor.name) {
				return true;
			}
		}
		
		return false;
	}
}
