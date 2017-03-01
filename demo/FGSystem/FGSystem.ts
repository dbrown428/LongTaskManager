import {DownloadMediaLongTaskConfiguration} from "../DownloadMedia/DownloadMediaLongTaskConfiguration";
import {LongTaskManager} from "../../src/Domain/LongTaskManager";
import {LongTaskRegistryImp} from "../../src/Domain/LongTaskRegistryImp";
import {LoggerConsole} from "../../src/Shared/Log/LoggerConsole";
// import {LongTaskSettingsTesting} from ""
import {LongTaskStatusChangeValidator} from "../../src/Domain/LongTaskStatusChangeValidator";	// remove
import {LongTaskRepositoryArray} from "../../src/Domain/LongTaskRepositoryArray";
import {LongTaskTrackerArray} from "../../src/Domain/LongTaskTrackerArray";
import {BaseTwoExponentialBackoff} from "../../src/Shared/Backoff/BaseTwoExponentialBackoff";
import {LongTaskManagerDefault} from "../../src/Domain/LongTaskManagerDefault";

export class FGSystem {
	manager: LongTaskManager;

	makeLongTaskManager() {


		// What if there are multiple instances running?

		// Register the LongTasks.
		// =======================================================================================
		const downloadMediaLongTaskConfig = new DownloadMediaLongTaskConfiguration;
		const registry = new LongTaskRegistryImp;
		registry.add(downloadMediaLongTaskConfig);

		const logger = new LoggerConsole;
		// Set the concurrency... TODO
		const concurrencyMaximum = 2;
		// LongTaskSettingsTesting.withConcurrencyOf(2)
		const settings = new LongTaskSettingsTesting;	// It would be better to set these values explicitly for tests.

		const validator = new LongTaskStatusChangeValidator;	// remove
		const repository = new LongTaskRepositoryArray(validator);
		const tracker = new LongTaskTrackerArray;
		const backoff = BaseTwoExponentialBackoff.withMultiplierAndMaximum(settings.backoffStepTime, settings.backoffMaximumTime);
		
		this.manager = new LongTaskManagerDefault(logger, backoff, settings, tracker, repository, registry);
		this.manager.start();
	}
}
