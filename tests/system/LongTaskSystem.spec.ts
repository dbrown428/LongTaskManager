import {assert} from "chai";
import {UserId} from "../../src/Shared/Values/UserId";
import {LoggerSpy} from "../../src/Shared/Log/LoggerSpy";
import {LongTaskManager} from "../../src/Domain/LongTaskManager";
import {LongTaskManagerImp} from "../../src/Domain/LongTaskManagerImp";
import {LongTaskRegistryImp} from "../../src/Domain/LongTaskRegistryImp";
import {LongTaskTrackerArray} from "../../src/Domain/LongTaskTrackerArray";
import {LongTaskSettingsDevelopment} from "../../src/App/LongTaskSettingsDevelopment";
import {BaseTwoExponentialBackoff} from "../../src/Shared/Backoff/BaseTwoExponentialBackoff";
import {LongTaskProcessorConfiguration} from "../../src/Domain/LongTaskProcessorConfiguration";
import {DownloadMediaProcessorConfiguration} from "../doubles/DownloadMediaProcessorConfiguration";
import {LongTaskRepositoryArray} from "../../src/Infrastructure/Persistence/LongTaskRepositoryArray";

// .only
describe("Long Task System", () => {
	it("should process tasks", () => {

		// Add sample task processor(s)
		const downloadMediaProcessorConfig = new DownloadMediaProcessorConfiguration;
		const registry = new LongTaskRegistryImp;
		registry.add(downloadMediaProcessorConfig);

		const logger = new LoggerSpy;
		const config = new LongTaskSettingsDevelopment;
		const repository = new LongTaskRepositoryArray;
		const tracker = new LongTaskTrackerArray;
		const backoff = BaseTwoExponentialBackoff.withMultiplierAndMaximum(config.backoffStepTime, config.backoffMaximumTime);
		const manager = new LongTaskManagerImp(logger, backoff, config, tracker, repository, registry);

		const p1 = addSampleDownloadTaskToManager([
			"http://amazing-space.stsci.edu/uploads/resource_image/image/204/hs-2013-51-a-full_jpg.jpg",
			"http://farm8.staticflickr.com/7315/11920653765_8dbd136b17_o.jpg",
			"http://www.sample-videos.com/video/mp4/720/big_buck_bunny_720p_1mb.mp4",
		], downloadMediaProcessorConfig, manager);

		const p2 = addSampleDownloadTaskToManager([
			"http://cdn.spacetelescope.org/archives/images/publicationjpg/heic1502a.jpg",
			"http://cdn.spacetelescope.org/archives/images/large/opo0324a.jpg",
			"http://c2.staticflickr.com/8/7151/6760135001_14c59a1490_o.jpg",
		], downloadMediaProcessorConfig, manager);

		const p3 = addSampleDownloadTaskToManager([
			"http://www.nasa.gov/sites/default/files/thumbnails/image/hs-2015-02-a-hires_jpg.jpg",
			"http://www.sample-videos.com/video/mp4/720/big_buck_bunny_720p_20mb.mp4",
		], downloadMediaProcessorConfig, manager);

		return Promise.all([p1, p2, p3]).then(() => {
			manager.start();

			// 

			// how do we test that the system has processed the tasks?
			// - the task processor could count.
			// - need a way of waiting until all tasks are completed before asserting
			//
			// After x time, check results?
			// - expecting x calls to getNextTask?

			// manual verification for now.
		});
	});

	function addSampleDownloadTaskToManager(items: Array <string>, config: LongTaskProcessorConfiguration, manager: LongTaskManager): Promise <void> {
		const serializedItems = JSON.stringify(items);
		const taskType = config.key();
		const params = "{media:" + serializedItems +"}";
		const ownerId = new UserId("123");
		const searchKey: string = ownerId.value;
		
		// return new Promise((resolve: (content: void) => void, reject: (e: string) => void) => {});
		return manager.addTask(taskType, params, ownerId, searchKey).then(() => {

			return;
		});
	}
});
