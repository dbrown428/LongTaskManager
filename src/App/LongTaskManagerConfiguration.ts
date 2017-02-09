import {LongTaskManager} from "./LongTaskManager";
import {LongTaskManagerImp} from "./LongTaskManagerImp";
import {LoggerConsole} from "../Shared/Log/LoggerConsole";
import {LongTaskSettingsDevelopment} from "./LongTaskSettingsDevelopment";
// import {LongTaskProcessorRegistration} from "./LongTaskProcessorRegistration";
import {BaseTwoExponentialBackoff} from "../Shared/Backoff/BaseTwoExponentialBackoff";
import {LongTaskRepositoryArray} from "../Infrastructure/Persistence/LongTaskRepositoryArray";

export class LongTaskManagerConfiguration {
	static default(): LongTaskManager {
		const logger = new LoggerConsole;

		// Who should configure the system... API/App?
		const config = new LongTaskSettingsDevelopment;	// this is a pain point.
		const repository = new LongTaskRepositoryArray;
		// const longTaskProcessors = new LongTaskProcessorRegistration;
		const backoff = BaseTwoExponentialBackoff.withMultiplierAndMaximum(config.backoffStepTime, config.backoffMaximumTime);
		const manager = new LongTaskManagerImp(backoff, config, repository, logger);
		
		// maybe this isn't the place to register task processors... APP perhaps?
		// longTaskProcessors.registerInManager(manager);
		return manager;
	}

	private constructor() {}
}
