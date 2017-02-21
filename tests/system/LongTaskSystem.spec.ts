import {assert} from "chai";
import {UserId} from "../../src/Shared/Values/UserId";
import {LongTaskId} from "../../src/Domain/LongTaskId";
import {Duration} from "../../src/Shared/Values/Duration";
import {LoggerConsole} from "../../src/Shared/Log/LoggerConsole";
import {LongTaskManager} from "../../src/Domain/LongTaskManager";
import {LongTaskRegistry} from "../../src/Domain/LongTaskRegistry";
import {LongTaskManagerImp} from "../../src/Domain/LongTaskManagerImp";
import {LongTaskRegistryImp} from "../../src/Domain/LongTaskRegistryImp";
import {LongTaskTrackerArray} from "../../src/Domain/LongTaskTrackerArray";
import {DownloadMediaParameters} from "../doubles/DownloadMediaParameters";
import {LongTaskSettingsDevelopment} from "../../src/App/LongTaskSettingsDevelopment";
import {BaseTwoExponentialBackoff} from "../../src/Shared/Backoff/BaseTwoExponentialBackoff";
import {LongTaskProcessorConfiguration} from "../../src/Domain/LongTaskProcessorConfiguration";
import {DownloadMediaProcessorConfiguration} from "../doubles/DownloadMediaProcessorConfiguration";
import {LongTaskStatusChangeValidator} from "../../src/Domain/LongTaskStatusChangeValidator";
import {LongTaskRepositoryArray} from "../../src/Infrastructure/Persistence/LongTaskRepositoryArray";

describe.only("Long Task System", () => {

	it("should process multiple tasks concurrently up to maximum.", async () => {
		// Add sample task processor(s)
		const downloadMediaProcessorConfig = new DownloadMediaProcessorConfiguration;
		const registry = new LongTaskRegistryImp;
		registry.add(downloadMediaProcessorConfig);
		const manager: LongTaskManager = configureManagerWithConcurrencyOf(registry, 2);

		const p1 = await addSampleDownloadTaskToManager([
			"http://amazing-space.stsci.edu/uploads/resource_image/image/204/hs-2013-51-a-full_jpg.jpg",
			"http://farm8.staticflickr.com/7315/11920653765_8dbd136b17_o.jpg",
			"http://www.sample-videos.com/video/mp4/720/big_buck_bunny_720p_1mb.mp4",
		], downloadMediaProcessorConfig, manager);

		const p2 = await addSampleDownloadTaskToManager([
			"http://cdn.spacetelescope.org/archives/images/publicationjpg/heic1502a.jpg",
			"http://cdn.spacetelescope.org/archives/images/large/opo0324a.jpg",
			"http://c2.staticflickr.com/8/7151/6760135001_14c59a1490_o.jpg",
		], downloadMediaProcessorConfig, manager);

		const p3 = await addSampleDownloadTaskToManager([
			"http://www.nasa.gov/sites/default/files/thumbnails/image/hs-2015-02-a-hires_jpg.jpg",
			"http://www.sample-videos.com/video/mp4/720/big_buck_bunny_720p_20mb.mp4",
		], downloadMediaProcessorConfig, manager);

		const tasks = await manager.getTasksForUserId(userId);
		assert.lengthOf(tasks, 3);

		await Promise.all([p1, p2, p3]);
		manager.start();
		console.log("Started long task manager");
		await delay(Duration.withMilliseconds(100));
		
		assert.equal(manager.processingCount(), 2);

		// Many of these files could take a few seconds each.
		// Replace files with dummies, so we aren't using up someone elses bandwidth.
		// todo

		// add a timeout... if not done in 2000 ms, then fail this test. Default chai/mocha behaviour?
		// todo

		while (true) {
			const count = manager.processingCount();

			if (count == 0) {
				break;
			}
		}

		// check the results.
		// todo

	});

	async function delay(duration: Duration): Promise <void> {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				resolve(),
			}, duration.inMilliseconds());
		});
	}

	function configureManagerWithConcurrencyOf(registry: LongTaskRegistry, concurrency: number): LongTaskManager {
		const logger = new LoggerConsole;

		// Set the concurrency... TODO
		// LongTaskSettingsTesting.withConcurrencyOf(2)
		const settings = new LongTaskSettingsDevelopment;	// It would be better to set these values explicitly for tests.

		const validator = new LongTaskStatusChangeValidator;
		const repository = new LongTaskRepositoryArray(validator);
		const tracker = new LongTaskTrackerArray;
		const backoff = BaseTwoExponentialBackoff.withMultiplierAndMaximum(settings.backoffStepTime, settings.backoffMaximumTime);
		const manager = new LongTaskManagerImp(logger, backoff, settings, tracker, repository, registry);

		return manager;
	}

	async function addSampleDownloadTaskToManager(items: Array <string>, config: LongTaskProcessorConfiguration, manager: LongTaskManager): Promise <void> {
		const taskType = config.key();
		const ownerId = new UserId("123");
		const searchKey: string = ownerId.value;
		const params = DownloadMediaParameters.withItems(items);
		
		await manager.addTask(taskType, params, ownerId, searchKey)
		console.log("Added sample task");
		return Promise.resolve();
	}
});
