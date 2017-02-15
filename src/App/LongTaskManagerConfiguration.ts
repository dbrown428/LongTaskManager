import {LongTaskManager} from "./LongTaskManager";
import {LongTaskManagerImp} from "./LongTaskManagerImp";
import {LongTaskRegistryImp} from "./LongTaskRegistryImp";
import {LoggerConsole} from "../Shared/Log/LoggerConsole";
import {LongTaskTrackerArray} from "./LongTaskTrackerArray";
import {LongTaskSettingsDevelopment} from "./LongTaskSettingsDevelopment";
import {BaseTwoExponentialBackoff} from "../Shared/Backoff/BaseTwoExponentialBackoff";
import {LongTaskRepositoryArray} from "../Infrastructure/Persistence/LongTaskRepositoryArray";

export class LongTaskManagerConfiguration {
	static default(): LongTaskManager {
		
		// This could be passed in...
		const longTaskProcessors = new LongTaskRegistryImp;
		// longTaskProcessors.add(configuration);

		// Who should configure the system... API/App?
		const logger = new LoggerConsole;
		const config = new LongTaskSettingsDevelopment;	// this is a pain point.
		const repository = new LongTaskRepositoryArray;
		const tracker = new LongTaskTrackerArray;
		const backoff = BaseTwoExponentialBackoff.withMultiplierAndMaximum(config.backoffStepTime, config.backoffMaximumTime);
		const manager = new LongTaskManagerImp(backoff, config, tracker, repository, logger);

		return manager;
	}

	private constructor() {}
}
