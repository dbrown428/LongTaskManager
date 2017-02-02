import {LongTaskManager} from "./LongTaskManager";
import {ConsoleLogger} from "./Log/ConsoleLogger";
import {LongTaskManagerImp} from "./LongTaskManagerImp";
import {LongTaskRepositoryFileSystem} from "./LongTaskRepositoryFileSystem";
import {BaseTwoExponentialBackoff} from "./Backoff/BaseTwoExponentialBackoff";
import {LongTaskProcessorRegistration} from "./LongTaskProcessorRegistration";
import {LongTaskConfigurationDevelopment} from "./LongTaskConfigurationDevelopment";
import {PublishSummaryReportsTaskProcessorConfiguration} from "./PublishSummaryReportsTaskProcessorConfiguration";

export class LongTaskManagerConfiguration {
	static default(): LongTaskManager {
		const logger = new ConsoleLogger;
		const config = new LongTaskConfigurationDevelopment;
		const repository = new LongTaskRepositoryFileSystem;
		const longTaskProcessors = new LongTaskProcessorRegistration;
		const backoff = BaseTwoExponentialBackoff.withMultiplierAndMaximum(100, 6400);
		const manager = new LongTaskManagerImp(backoff, config, repository, logger);
		
		longTaskProcessors.registerInManager(manager);
		return manager;
	}

	private constructor() {}
}
