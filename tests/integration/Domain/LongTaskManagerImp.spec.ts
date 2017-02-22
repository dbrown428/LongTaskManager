import {assert} from "chai";
import {UserId} from "../../../src/Shared/Values/UserId";
import {LongTaskId} from "../../../src/Domain/LongTaskId";
import {LoggerSpy} from "../../../src/Shared/Log/LoggerSpy";
import {LongTaskType} from "../../../src/Domain/LongTaskType";
import {LongTaskClaim} from "../../../src/Domain/LongTaskClaim";
import {BackoffSpy} from "../../../src/Shared/Backoff/BackoffSpy";
import {LoggerConsole} from "../../../src/Shared/Log/LoggerConsole";
import {BackoffDummy} from "../../../src/Shared/Backoff/BackoffDummy";
import {LongTaskProgress} from "../../../src/Domain/LongTaskProgress";
import {LongTaskManagerImp} from "../../../src/Domain/LongTaskManagerImp";
import {LongTaskRegistryImp} from "../../../src/Domain/LongTaskRegistryImp";
import {LongTaskParametersDummy} from "../../doubles/LongTaskParametersDummy";
import {LongTaskTrackerArray} from "../../../src/Domain/LongTaskTrackerArray";
import {LongTaskSettingsDevelopment} from "../../../src/App/LongTaskSettingsDevelopment";
import {LongTaskStatusChangeValidator} from "../../../src/Domain/LongTaskStatusChangeValidator";
import {LongTaskRepositorySpy} from "../../../src/Infrastructure/Persistence/LongTaskRepositorySpy";
import {LongTaskRepositoryArray} from "../../../src/Infrastructure/Persistence/LongTaskRepositoryArray";
import {PackageFilesProcessorConfigurationDummy} from "../../doubles/PackageFilesProcessorConfigurationDummy";
import {ReportGeneratorProcessorConfigurationDummy} from "../../doubles/ReportGeneratorProcessorConfigurationDummy";

describe("Long task manager", () => {
	describe("Add task", () => {
		it("should throw an exception if task type is added that is not registered with the system.", async () => {
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

		it("should add a task that has a registered type.", async () => {
			const logger = new LoggerSpy;
			const backoff = new BackoffSpy;
			const tracker = new LongTaskTrackerArray;

			const processorDummy = new ReportGeneratorProcessorConfigurationDummy;
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

	describe("System", () => {
		it("should not process tasks until the system has been started.", async () => {
			const logger = new LoggerSpy;
			const backoff = new BackoffSpy;
			const tracker = new LongTaskTrackerArray;

			const processorDummy = new ReportGeneratorProcessorConfigurationDummy;
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

		it("should begin processing long tasks when it is started.", async () => {
			const logger = new LoggerSpy;
			const backoff = new BackoffSpy;
			const tracker = new LongTaskTrackerArray;

			const processorDummy = new ReportGeneratorProcessorConfigurationDummy;
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
			manager.start();

			// await delay(Duration.withMilliseconds(10));

			const processingTasks = await manager.getTasksCurrentlyProcessing();
			assert.lengthOf(processingTasks, 1);
		});
	});

	describe("Completed task", () => {
		it("should be removed from processing when completed.", async () => {
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

		it("Should handle an unexpected completed task error.");
	});

	describe("Failed Task", () => {
		it("Should update status to failed for a processing task.");
		// - make sure it's removed from processing.
	});

	describe("Cancel Task", () => {
		it("Should be removed from processing when cancelled.");
		it("Should no longer be available as a next queued task.");
		it("Should handle an unexpected error");
	});

	describe("Delete Task", () => {
		it("Should be removed from processing when deleted.");
		// associated cleanup
	});

	describe("Try Next Task", () => {
		it("Should handle an unexpected get next task error.");
	});
	
});
