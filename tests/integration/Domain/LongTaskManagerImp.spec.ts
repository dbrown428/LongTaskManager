import {assert} from "chai";
import {Delayable} from "../../doubles/Delayable";
import {UserId} from "../../../src/Shared/Values/UserId";
import {LongTaskId} from "../../../src/Domain/LongTaskId";
import {LoggerSpy} from "../../../src/Shared/Log/LoggerSpy";
import {Duration} from "../../../src/Shared/Values/Duration";
import {LongTaskType} from "../../../src/Domain/LongTaskType";
import {LongTaskClaim} from "../../../src/Domain/LongTaskClaim";
import {BackoffSpy} from "../../../src/Shared/Backoff/BackoffSpy";
import {LoggerConsole} from "../../../src/Shared/Log/LoggerConsole";
import {BackoffDummy} from "../../../src/Shared/Backoff/BackoffDummy";

import {LongTaskRegistry} from "../../../src/Domain/LongTaskRegistry";
import {LongTaskManager} from "../../../src/Domain/LongTaskManager";
import {DownloadMediaParameters} from "../../doubles/DownloadMediaParameters";
import {BaseTwoExponentialBackoff} from "../../../src/Shared/Backoff/BaseTwoExponentialBackoff";
import {DownloadMediaProcessorConfiguration} from "../../doubles/DownloadMediaProcessorConfiguration";
import {LongTaskProcessorConfiguration} from "../../../src/Domain/LongTaskProcessorConfiguration";


import {LongTaskProgress} from "../../../src/Domain/LongTaskProgress";
import {LongTaskManagerImp} from "../../../src/Domain/LongTaskManagerImp";
import {LongTaskRegistryImp} from "../../../src/Domain/LongTaskRegistryImp";
import {LongTaskParametersDummy} from "../../doubles/LongTaskParametersDummy";
import {LongTaskTrackerArray} from "../../../src/Domain/LongTaskTrackerArray";
import {LongTaskSettingsDevelopment} from "../../../src/App/LongTaskSettingsDevelopment";
import {LongTaskStatusChangeValidator} from "../../../src/Domain/LongTaskStatusChangeValidator";
import {LongTaskRepositorySpy} from "../../../src/Infrastructure/Persistence/LongTaskRepositorySpy";
import {LongTaskProcessorConfigurationDummy} from "../../doubles/LongTaskProcessorConfigurationDummy";
import {LongTaskRepositoryArray} from "../../../src/Infrastructure/Persistence/LongTaskRepositoryArray";
import {DelayedResultsProcessorConfiguration} from "../../doubles/DelayedResultsProcessorConfiguration";

describe ("Long task manager", () => {
	describe ("Add task", () => {
		it ("should throw an exception if task type is added that is not registered with the system.", async () => {
			const logger = new LoggerSpy;
			const backoff = new BackoffSpy;
			const tracker = new LongTaskTrackerArray;
			const processors = new LongTaskRegistryImp;
			const type = LongTaskType.withValue("awesome-task");
			const validator = new LongTaskStatusChangeValidator;	// should this be in the layer above?
			const repository = new LongTaskRepositoryArray(validator);
			const config = new LongTaskSettingsDevelopment;
			const manager = new LongTaskManagerImp(logger, backoff, config, tracker, repository, processors);
			const params = LongTaskParametersDummy.withJson("{key:value}");
			const ownerId = new UserId("321");
			const searchKey = "hello";

			try {
				await manager.addTask(type, params, ownerId, searchKey);
			} catch (error) {
				assert.isNotNull(error);
			}
		});

		it ("should add a task that has a registered type.", async () => {
			const logger = new LoggerSpy;
			const backoff = new BackoffSpy;
			const tracker = new LongTaskTrackerArray;

			const processorDummy = new LongTaskProcessorConfigurationDummy;
			const type = processorDummy.key();
			const processors = new LongTaskRegistryImp;
			processors.add(processorDummy);

			const validator = new LongTaskStatusChangeValidator;	// should this be in the layer above?
			const repository = new LongTaskRepositoryArray(validator);
			const config = new LongTaskSettingsDevelopment;
			const manager = new LongTaskManagerImp(logger, backoff, config, tracker, repository, processors);
			const params = LongTaskParametersDummy.withJson("{key:value}");
			const ownerId = new UserId("321");
			const searchKey = "hello";
			const taskId = await manager.addTask(type, params, ownerId, searchKey);
			const tasks = await manager.getTasksForUserId(ownerId);

			assert.lengthOf(tasks, 1);
		});
	});
	
	it ("should not process tasks until the system has been started.", async () => {
		const logger = new LoggerSpy;
		const backoff = new BackoffSpy;
		const tracker = new LongTaskTrackerArray;

		const processorDummy = new LongTaskProcessorConfigurationDummy;
		const type = processorDummy.key();
		const processors = new LongTaskRegistryImp;
		processors.add(processorDummy);

		const validator = new LongTaskStatusChangeValidator;	// should this be in the layer above?
		const repository = new LongTaskRepositoryArray(validator);
		const config = new LongTaskSettingsDevelopment;
		const manager = new LongTaskManagerImp(logger, backoff, config, tracker, repository, processors);
		const params = LongTaskParametersDummy.withJson("{key:value}");
		const ownerId = new UserId("321");
		const searchKey = "hello";
		const taskId = await manager.addTask(type, params, ownerId, searchKey);
		const processingTasks = await manager.getTasksCurrentlyProcessing();

		assert.lengthOf(processingTasks, 0);
	});

	it ("should begin processing long tasks when the system starts.", async () => {
		const logger = new LoggerSpy;
		const backoff = new BackoffSpy;
		const tracker = new LongTaskTrackerArray;

		const delayedResultsProcessorConfig = new DelayedResultsProcessorConfiguration();
		delayedResultsProcessorConfig.setDelay(Duration.withMilliseconds(20));

		const type = delayedResultsProcessorConfig.key();
		const processors = new LongTaskRegistryImp;
		processors.add(delayedResultsProcessorConfig);

		const validator = new LongTaskStatusChangeValidator;	// should this be in the layer above?
		const repository = new LongTaskRepositoryArray(validator);
		const config = new LongTaskSettingsDevelopment;
		const manager = new LongTaskManagerImp(logger, backoff, config, tracker, repository, processors);

		const params = LongTaskParametersDummy.withJson("{key:value}");
		const ownerId = new UserId("321");
		const searchKey = "hello";
		
		const taskId = await manager.addTask(type, params, ownerId, searchKey);
		manager.start();
		await Delayable.delay(Duration.withMilliseconds(10));

		const processingTasks = await manager.getTasksCurrentlyProcessing();
		assert.lengthOf(processingTasks, 1);
	});


	it ("should process multiple tasks concurrently up to maximum.", async () => {
		// Add sample task processor(s)
		const downloadMediaProcessorConfig = new DownloadMediaProcessorConfiguration;
		const registry = new LongTaskRegistryImp;
		registry.add(downloadMediaProcessorConfig);
		const manager: LongTaskManager = configureManagerWithConcurrencyOf(registry, 2);
		const ownerId = new UserId("123");

		const p1 = await addSampleDownloadTaskToManager([
			"http://amazing-space.stsci.edu/uploads/resource_image/image/204/hs-2013-51-a-full_jpg.jpg",
			"http://farm8.staticflickr.com/7315/11920653765_8dbd136b17_o.jpg",
			"http://www.sample-videos.com/video/mp4/720/big_buck_bunny_720p_1mb.mp4",
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

		const tasks = await manager.getTasksForUserId(ownerId);
		assert.lengthOf(tasks, 3);

		await Promise.all([p1, p2, p3]);
		manager.start();
		console.log("Started long task manager");
		await Delayable.delay(Duration.withMilliseconds(100));
		
		const processingTasks = await manager.getTasksCurrentlyProcessing();
		assert.lengthOf(processingTasks, 2);

		// Many of these files could take a few seconds each.
		// Replace files with dummies, so we aren't using up someone elses bandwidth.
		// todo

		// add a timeout... if not done in 2000 ms, then fail this test. Default chai/mocha behaviour?
		// todo



		// while (true) {
		// 	const count = manager.processingCount();

		// 	if (count == 0) {
		// 		break;
		// 	}
		// }

		// check the results.
		// todo

	});

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

	async function addSampleDownloadTaskToManager(items: Array <string>, userId: UserId, config: LongTaskProcessorConfiguration, manager: LongTaskManager): Promise <void> {
		const taskType = config.key();
		const searchKey: string = userId.value;
		const params = DownloadMediaParameters.withItems(items);
		
		await manager.addTask(taskType, params, userId, searchKey)
		console.log("Added sample task");
		return Promise.resolve();
	}


	it ("should remove completed tasks from processing.", async () => {
		const logger = new LoggerSpy;
		const backoff = new BackoffSpy;
		const tracker = new LongTaskTrackerArray;
		const processors = new LongTaskRegistryImp;
		const validator = new LongTaskStatusChangeValidator;	// should this be in the layer above?
		const repository = new LongTaskRepositoryArray(validator);
		const config = new LongTaskSettingsDevelopment;
		const manager = new LongTaskManagerImp(logger, backoff, config, tracker, repository, processors);

		const type = LongTaskType.withValue("awesome-task");
		const params = "{key:value}";
		const ownerId = new UserId("321");
		const searchKey = "hello";

		// probably need to redo this... as all of these will fail because the task types are not registered.
		const values: Array <LongTaskId> = await Promise.all([
			repository.add(LongTaskType.withValue("awesome-task"), LongTaskParametersDummy.withJson("{key: value}"), new UserId("123"), "hello"),
			repository.add(LongTaskType.withValue("great-task"), LongTaskParametersDummy.withJson("{students: [1,2,3,4]"), new UserId("324"), "4"),
			repository.add(LongTaskType.withValue("ok-task"), LongTaskParametersDummy.withJson("{teacher: 5}"), new UserId("802"), "grande"),
		]);
	
		// start.
		// delay - eek
		// const processingTasks = await manager.getTasksCurrentlyProcessing();
		// expecting 0

		assert.isTrue(false);
	});

	it ("should handle an unexpected completed task error.");
	it ("should update status to failed for a processing task.");

	describe ("cancel task", () => {
		it ("should be remove from processing.");
		it ("should no longer be available as a next queued task.");
		it ("should handle an unexpected error");

		// task cleanup ??
	});

	describe ("delete task", () => {
		it ("should be removed from processing when deleted.");
		// associated cleanup ??
	});
	
});
