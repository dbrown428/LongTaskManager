

// Demo - show all running
// 

		const downloadMediaProcessorConfig = new DownloadMediaProcessorConfiguration;
		const registry = new LongTaskRegistryImp;
		registry.add(downloadMediaProcessorConfig);

		const logger = new LoggerConsole;
		// Set the concurrency... TODO
		const concurrencyMaximum = 2;
		// LongTaskSettingsTesting.withConcurrencyOf(2)
		const settings = new LongTaskSettingsDevelopment;	// It would be better to set these values explicitly for tests.

		const validator = new LongTaskStatusChangeValidator;
		const repository = new LongTaskRepositoryArray(validator);
		const tracker = new LongTaskTrackerArray;
		const backoff = BaseTwoExponentialBackoff.withMultiplierAndMaximum(settings.backoffStepTime, settings.backoffMaximumTime);
		const manager = new LongTaskManagerImp(logger, backoff, settings, tracker, repository, registry);
		const ownerId = UserId.withValue("123");

		const p1 = await addSampleDownloadTaskToManager([
			"http://amazing-space.stsci.edu/uploads/resource_image/image/204/hs-2013-51-a-full_jpg.jpg",
			"http://farm8.staticflickr.com/7315/11920653765_8dbd136b17_o.jpg",
			"http://www.sample-videos.com/video/mp4/720/big_buck_bunny_720p_1mb.mp4",
			"https://freewallpap.files.wordpress.com/2012/01/the-best-top-desktop-space-wallpapers-2.jpeg",
		], ownerId, downloadMediaProcessorConfig, manager);

		const p2 = await addSampleDownloadTaskToManager([
			"http://cdn.spacetelescope.org/archives/images/publicationjpg/heic1502a.jpg",
			"http://cdn.spacetelescope.org/archives/images/large/opo0324a.jpg",
			"http://c2.staticflickr.com/8/7151/6760135001_14c59a1490_o.jpg",
		], ownerId, downloadMediaProcessorConfig, manager);

		const p3 = await addSampleDownloadTaskToManager([
			"http://www.nasa.gov/sites/default/files/thumbnails/image/hs-2015-02-a-hires_jpg.jpg",
			"http://www.sample-videos.com/video/mp4/720/big_buck_bunny_720p_20mb.mp4",
		], ownerId, downloadMediaProcessorConfig, manager);

		const taskIds: Array <LongTaskId> = await Promise.all([p1, p2, p3]);
		manager.start();

		// Want to see the entire thing running... end to end.
		// 
	
	
	async function addSampleDownloadTaskToManager(items: Array <string>, userId: UserId, config: LongTaskProcessorConfiguration, manager: LongTaskManager): Promise <LongTaskId> {
		const taskType = config.key();
		const searchKey: string = userId.value;
		const params = DownloadMediaParameters.withItems(items);
		const taskId = await manager.addTask(taskType, params, userId, searchKey);

		return Promise.resolve(taskId);
	}