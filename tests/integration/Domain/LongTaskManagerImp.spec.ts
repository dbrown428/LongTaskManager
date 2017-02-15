import {assert} from "chai";
import {Promise} from "es6-promise";
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
import {LongTaskTrackerArray} from "../../../src/Domain/LongTaskTrackerArray";
import {LongTaskSettingsDevelopment} from "../../../src/App/LongTaskSettingsDevelopment";
import {LongTaskRepositorySpy} from "../../../src/Infrastructure/Persistence/LongTaskRepositorySpy";
import {LongTaskRepositoryArray} from "../../../src/Infrastructure/Persistence/LongTaskRepositoryArray";
import {PackageFilesProcessorConfigurationDummy} from "../../doubles/PackageFilesProcessorConfigurationDummy";
import {ReportGeneratorProcessorConfigurationDummy} from "../../doubles/ReportGeneratorProcessorConfigurationDummy";

describe("Long task manager", () => {
	describe("add task", () => {
		it("should reset the backoff.", () => {
			const logger = new LoggerSpy;
			const backoff = new BackoffSpy;
			const tracker = new LongTaskTrackerArray;
			const processors = new LongTaskRegistryImp;
			const repository = new LongTaskRepositorySpy;
			const config = new LongTaskSettingsDevelopment;
			const manager = new LongTaskManagerImp(logger, backoff, config, tracker, repository, processors);

			const type: LongTaskType = {type: "awesome-task"};
			const params = "{key:value}";
			const ownerId = new UserId("321");
			const searchKey = "hello";

			return manager.addTask(type, params, ownerId, searchKey)
				.then((taskId: LongTaskId) => {
					assert.equal(1, backoff.resetCount());
					assert.isNotNull(taskId.value);
				});
		});

		it("should not process tasks unless the system has been started.");
	});

	// verify when we claim a task it's added to the processing list.
	// todo
	describe("Claim Task", () => {
		it("should change the processing count when a task is claimed,", () => {}

		);
	});

	describe("Complete Task", () => {
		it("Should be removed from processing when completed.", () => {
			const logger = new LoggerSpy;
			const backoff = new BackoffSpy;
			const tracker = new LongTaskTrackerArray;
			const processors = new LongTaskRegistryImp;
			const repository = new LongTaskRepositoryArray;
			const config = new LongTaskSettingsDevelopment;
			const manager = new LongTaskManagerImp(logger, backoff, config, tracker, repository, processors);

			const type: LongTaskType = {type: "awesome-task"};
			const params = "{key:value}";
			const ownerId = new UserId("321");
			const searchKey = "hello";

			// async await.

			return Promise.all([
				repository.add("awesome-task", "{key: value}", new UserId("123"), "hello"),
				repository.add("great-task", "{students: [1,2,3,4]", new UserId("324"), "4"),
				repository.add("ok-task", "teacher: 5", new UserId("802"), "grande"),
				])
				.then((values: Array <LongTaskId>) => {
					const progress = LongTaskProgress.withStateCurrentStepAndMaximumSteps("completed: [1,2], failed: []", 10, 15);

					return Promise.all([
						repository.claim(values[0], LongTaskClaim.withNowTimestamp()),
						repository.claim(values[1], LongTaskClaim.withNowTimestamp()),
						manager.completedTask(values[1], progress),
					]);
				})
				.then(() => {
					assert.equal(2, tracker.count());
					// verify the processing count.
					// assert processing count.
					// does it really matter?
				});
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
