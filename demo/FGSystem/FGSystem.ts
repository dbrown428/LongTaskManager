
export class FGSystem {
	readonly manager: LongTaskManager;

	constructor() {
		// Register the LongTasks.
		// =======================================================================================
		const downloadMediaLongTaskConfig = new DownloadMediaLongTaskConfiguration;
		const registry = new LongTaskRegistryImp;
		registry.add(downloadMediaLongTaskConfig);

		const logger = new LoggerConsole;
		// Set the concurrency... TODO
		const concurrencyMaximum = 2;
		// LongTaskSettingsTesting.withConcurrencyOf(2)
		const settings = new LongTaskSettingsDevelopment;	// It would be better to set these values explicitly for tests.

		const validator = new LongTaskStatusChangeValidator;
		const repository = new LongTaskRepositoryArray(validator);
		const tracker = new LongTaskTrackerArray;
		const backoff = BaseTwoExponentialBackoff.withMultiplierAndMaximum(settings.backoffStepTime, settings.backoffMaximumTime);
		
		this.manager = new LongTaskManagerImp(logger, backoff, settings, tracker, repository, registry);
		this.manager.start();
	}
}
