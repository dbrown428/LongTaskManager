import {assert} from "chai";
import {Delay} from "../../doubles/Delay";
import {UserId} from "../../../src/Shared/Values/UserId";
import {LongTaskId} from "../../../src/Domain/LongTaskId";
import {LoggerSpy} from "../../../src/Shared/Log/LoggerSpy";
import {Duration} from "../../../src/Shared/Values/Duration";
import {LongTaskType} from "../../../src/Domain/LongTaskType";
import {LongTaskClaim} from "../../../src/Domain/LongTaskClaim";
import {BackoffSpy} from "../../../src/Shared/Backoff/BackoffSpy";
import {LongTaskManager} from "../../../src/Domain/LongTaskManager";
import {LoggerConsole} from "../../../src/Shared/Log/LoggerConsole";
import {BackoffDummy} from "../../../src/Shared/Backoff/BackoffDummy";
import {LongTaskRegistry} from "../../../src/Domain/LongTaskRegistry";
import {LongTaskProgress} from "../../../src/Domain/LongTaskProgress";
import {LoggerSuppress} from "../../../src/Shared/Log/LoggerSuppress";
import {LongTaskManagerImpSpy} from "../../doubles/LongTaskManagerImpSpy";
import {LongTaskManagerImp} from "../../../src/Domain/LongTaskManagerImp";
import {LongTaskRegistryImp} from "../../../src/Domain/LongTaskRegistryImp";
import {MultipleItemsParameters} from "../../doubles/MultipleItemsParameters";
import {LongTaskParametersDummy} from "../../doubles/LongTaskParametersDummy";
import {LongTaskTrackerArray} from "../../../src/Domain/LongTaskTrackerArray";
import {DownloadMediaParameters} from "../../doubles/DownloadMediaParameters";
import {LongTaskSettingsDevelopment} from "../../../src/App/LongTaskSettingsDevelopment";
import {LongTaskStatusChangeValidator} from "../../../src/Domain/LongTaskStatusChangeValidator";
import {BaseTwoExponentialBackoff} from "../../../src/Shared/Backoff/BaseTwoExponentialBackoff";
import {LongTaskProcessorConfiguration} from "../../../src/Domain/LongTaskProcessorConfiguration";
import {LongTaskRepositorySpy} from "../../../src/Infrastructure/Persistence/LongTaskRepositorySpy";
import {LongTaskProcessorConfigurationDummy} from "../../doubles/LongTaskProcessorConfigurationDummy";
import {DownloadMediaProcessorConfiguration} from "../../doubles/DownloadMediaProcessorConfiguration";
import {LongTaskTypeUnregisteredException} from "../../../src/Domain/LongTaskTypeUnregisteredException";
import {LongTaskRepositoryArray} from "../../../src/Infrastructure/Persistence/LongTaskRepositoryArray";
import {DelayedResultsProcessorConfiguration} from "../../doubles/DelayedResultsProcessorConfiguration";
import {MultipleItemsProcessorConfiguration} from "../../doubles/MultipleItemsProcessorConfiguration";

describe("Long task manager", () => {
	it("should throw an exception if task is added that is not registered with the system.", async () => {
		const logger = new LoggerSpy;
		const backoff = new BackoffSpy;
		const tracker = new LongTaskTrackerArray;
		const processors = new LongTaskRegistryImp;
		const type = LongTaskType.withValue("awesome-task");
		const validator = new LongTaskStatusChangeValidator;	// should this be in the layer above?
		const repository = new LongTaskRepositoryArray(validator);
		const config = new LongTaskSettingsDevelopment;
		const manager = new LongTaskManagerImp(logger, backoff, config, tracker, repository, processors);
		const params = new LongTaskParametersDummy;
		const ownerId = UserId.withValue("321");
		const searchKey = "hello";

		try {
			await manager.addTask(type, params, ownerId, searchKey);
		} catch (error) {
			assert.instanceOf(error, LongTaskTypeUnregisteredException);
		}
	});

	it("should add a task that has a registered type.", async () => {
		const processorDummy = new LongTaskProcessorConfigurationDummy;
		const type = processorDummy.key();
		const processors = new LongTaskRegistryImp;
		processors.add(processorDummy);

		const logger = new LoggerSpy;
		const backoff = new BackoffSpy;
		const tracker = new LongTaskTrackerArray;
		const validator = new LongTaskStatusChangeValidator;	// should this be in the layer above?
		const repository = new LongTaskRepositoryArray(validator);
		const config = new LongTaskSettingsDevelopment;
		const manager = new LongTaskManagerImp(logger, backoff, config, tracker, repository, processors);
		const params = new LongTaskParametersDummy;
		const ownerId = UserId.withValue("321");
		const searchKey = "hello";
		const taskId = await manager.addTask(type, params, ownerId, searchKey);
		const tasks = await manager.getTasksForUserId(ownerId);

		assert.lengthOf(tasks, 1);
	});
	
	it("should not process tasks until the system has been started.", async () => {
		const processorDummy = new LongTaskProcessorConfigurationDummy;
		const type = processorDummy.key();
		const processors = new LongTaskRegistryImp;
		processors.add(processorDummy);

		const logger = new LoggerSpy;
		const backoff = new BackoffSpy;
		const tracker = new LongTaskTrackerArray;
		const validator = new LongTaskStatusChangeValidator;	// should this be in the layer above?
		const repository = new LongTaskRepositoryArray(validator);
		const config = new LongTaskSettingsDevelopment;
		const manager = new LongTaskManagerImp(logger, backoff, config, tracker, repository, processors);
		const params = new LongTaskParametersDummy;
		const ownerId = UserId.withValue("321");
		const searchKey = "hello";
		const taskId = await manager.addTask(type, params, ownerId, searchKey);
		const processingTasks = await manager.getTasksCurrentlyProcessing();

		assert.lengthOf(processingTasks, 0);
	});

	it("should begin processing long tasks when the system starts.", async () => {
		const delay = Duration.withMilliseconds(20);
		const delayedResultsProcessorConfig = new DelayedResultsProcessorConfiguration(delay);
		const type = delayedResultsProcessorConfig.key();
		const processorsRegistry = new LongTaskRegistryImp;
		processorsRegistry.add(delayedResultsProcessorConfig);

		const logger = new LoggerSuppress;
		const backoff = new BackoffSpy;
		const tracker = new LongTaskTrackerArray;
		const validator = new LongTaskStatusChangeValidator;	// should this be in the layer above?
		const repository = new LongTaskRepositoryArray(validator);
		const settings = new LongTaskSettingsDevelopment;
		const manager = new LongTaskManagerImp(logger, backoff, settings, tracker, repository, processorsRegistry);

		const params = new LongTaskParametersDummy;
		const ownerId = UserId.withValue("321");
		const searchKey = "hello";
		const taskId = await manager.addTask(type, params, ownerId, searchKey);
		manager.start();

		await Delay.for(Duration.withMilliseconds(3));
		const processingTasks = await manager.getTasksCurrentlyProcessing();
		assert.lengthOf(processingTasks, 1);
	});

	it("should process a task with a list of items in multiple ticks.", async () => {
		const multipleItemsPerTaskProcessorConfig = new MultipleItemsProcessorConfiguration();
		const type = multipleItemsPerTaskProcessorConfig.key();
		const processorsRegistry = new LongTaskRegistryImp;
		processorsRegistry.add(multipleItemsPerTaskProcessorConfig);

		const logger = new LoggerSuppress;
		const backoff = new BackoffSpy;
		const tracker = new LongTaskTrackerArray;
		const validator = new LongTaskStatusChangeValidator;	// should this be in the layer above?
		const repository = new LongTaskRepositoryArray(validator);
		const settings = new LongTaskSettingsDevelopment;
		const manager = new LongTaskManagerImpSpy(logger, backoff, settings, tracker, repository, processorsRegistry);

		const params = MultipleItemsParameters.withSampleItems([1, 2, 3, 4, 5]);
		const ownerId = UserId.withValue("321");
		const searchKey = "hello";
		const taskId = await manager.addTask(type, params, ownerId, searchKey);
		manager.start();

		await Delay.for(Duration.withMilliseconds(20));
		assert.equal(manager.updateTaskProgressCount(), 5);
		assert.equal(manager.completedTaskCount(), 1);
	});

	it("should process multiple tasks concurrently up to maximum.", async () => {
		const delay = Duration.withMilliseconds(20);
		const delayedResultsProcessorConfig = new DelayedResultsProcessorConfiguration(delay);
		const registry = new LongTaskRegistryImp;
		registry.add(delayedResultsProcessorConfig);

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
		
		const type = delayedResultsProcessorConfig.key();
		const params = new LongTaskParametersDummy;
		const ownerId = UserId.withValue("123");
		const searchKey = "hello world";
		const p1 = await repository.add(type, params, ownerId, searchKey);
		const p2 = await repository.add(type, params, ownerId, searchKey);
		const p3 = await repository.add(type, params, ownerId, searchKey);

		const taskIds: Array <LongTaskId> = await Promise.all([p1, p2, p3]);
		manager.start();
		await Delay.for(Duration.withMilliseconds(2));

		const tasks = await repository.getTasksWithIds(taskIds);
		assert.isTrue(tasks[0].isProcessing());
		assert.isTrue(tasks[1].isProcessing());
		assert.isFalse(tasks[2].isProcessing());
	});

	it("should remove completed tasks from processing.", async () => {
		const logger = new LoggerSpy;
		const backoff = new BackoffSpy;
		const tracker = new LongTaskTrackerArray;
		const processors = new LongTaskRegistryImp;
		const validator = new LongTaskStatusChangeValidator;
		const repository = new LongTaskRepositoryArray(validator);
		const config = new LongTaskSettingsDevelopment;
		const manager = new LongTaskManagerImp(logger, backoff, config, tracker, repository, processors);

		const type = LongTaskType.withValue("awesome-task");
		const params = "{key:value}";
		const ownerId = UserId.withValue("321");
		const searchKey = "hello";

		// probably need to redo this... as all of these will fail because the task types are not registered.
		const values: Array <LongTaskId> = await Promise.all([
			repository.add(LongTaskType.withValue("awesome-task"), new LongTaskParametersDummy, UserId.withValue("123"), "hello"),
			repository.add(LongTaskType.withValue("great-task"), new LongTaskParametersDummy, UserId.withValue("324"), "4"),
			repository.add(LongTaskType.withValue("ok-task"), new LongTaskParametersDummy, UserId.withValue("802"), "grande"),
		]);
	
		// add a single task.
		// update the state manually - should be completed state, but queued status.
		// start the system
		// delay
		// check that the status has been updated to completed (repository).
		// 

		assert.isTrue(false);
	});

	it("should handle an unexpected completed task error.");
	it("should update status to failed for a processing task.");

	describe("cancel task", () => {
		it("should be remove from processing.");
		it("should no longer be available as a next queued task.");
		it("should handle an unexpected error");

		// task cleanup ??
	});

	describe("delete task", () => {
		it("should be removed from processing when deleted.");
		// associated cleanup ??
	});
	
});
