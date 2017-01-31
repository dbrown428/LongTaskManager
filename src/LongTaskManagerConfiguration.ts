import {LongTaskManager} from "./LongTaskManager";
import {LongTaskManagerImp} from "./LongTaskManagerImp";
import {BaseTwoExponentialBackoff} from "./BaseTwoExponentialBackoff";
import {LongTaskRepositoryFileSystem} from "./LongTaskRepositoryFileSystem";
import {LongTaskProcessorRegistration} from "./LongTaskProcessorRegistration";
import {LongTaskConfigurationDevelopment} from "./LongTaskConfigurationDevelopment";
import {PublishSummaryReportsTaskProcessorConfiguration} from "./PublishSummaryReportsTaskProcessorConfiguration";

export class LongTaskManagerConfiguration {
	static default(): LongTaskManager {
		const config = new LongTaskConfigurationDevelopment;
		const repository = new LongTaskRepositoryFileSystem;
		const longTaskProcessors = new LongTaskProcessorRegistration;
		const backoff = BaseTwoExponentialBackoff.withMultiplierAndMaximum(100, 6400);

		// Language feature dependencies: date, json serializer, json deserializer… these should probably be wrapped.
		const manager = new LongTaskManagerImp(backoff, config, repository);
		
		longTaskProcessors.registerInManager(manager);
		return manager;
	}

	private constructor() {}
}
