import {assert} from "chai";
import {Promise} from "es6-promise";
import {UserId} from "../../../src/Shared/Values/UserId";
import {LongTaskId} from "../../../src/Domain/LongTaskId";
import {LoggerSpy} from "../../../src/Shared/Log/LoggerSpy";
import {LongTaskType} from "../../../src/Domain/LongTaskType";
import {BackoffSpy} from "../../../src/Shared/Backoff/BackoffSpy";
import {LoggerConsole} from "../../../src/Shared/Log/LoggerConsole";
import {BackoffDummy} from "../../../src/Shared/Backoff/BackoffDummy";
import {LongTaskManagerImp} from "../../../src/Domain/LongTaskManagerImp";
import {LongTaskSettingsDevelopment} from "../../../src/App/LongTaskSettingsDevelopment";
import {DummyPackageFilesProcessorConfiguration} from "./DummyPackageFilesProcessorConfiguration";
import {LongTaskRepositorySpy} from "../../../src/Infrastructure/Persistence/LongTaskRepositorySpy";
import {DummyReportGeneratorProcessorConfiguration} from "./DummyReportGeneratorProcessorConfiguration";

describe("Long task manager", () => {
	describe("Task processor keys", () => {
		it("Should return an empty list if nothing is registered.", () => {
			const logger = new LoggerConsole;
			const backoff = new BackoffDummy;
			const repository = new LongTaskRepositorySpy;
			const config = new LongTaskSettingsDevelopment;
			const manager = new LongTaskManagerImp(backoff, config, repository, logger);

			const keys = manager.getTaskProcessorKeys();
			assert.lengthOf(keys, 0);
		});

		it("Should return a list of registered task processors", () => {
			const logger = new LoggerConsole;
			const backoff = new BackoffDummy;
			const repository = new LongTaskRepositorySpy;
			const config = new LongTaskSettingsDevelopment;
			const manager = new LongTaskManagerImp(backoff, config, repository, logger);

			manager.registerTaskProcessor(new DummyPackageFilesProcessorConfiguration);
			manager.registerTaskProcessor(new DummyReportGeneratorProcessorConfiguration);

			const keys = manager.getTaskProcessorKeys();
			assert.lengthOf(keys, 2);
		});
	});

	describe("add task", () => {
		it("should reset the backoff.", () => {
			const logger = new LoggerSpy;
			const backoff = new BackoffSpy;
			const repository = new LongTaskRepositorySpy;
			const config = new LongTaskSettingsDevelopment;
			const manager = new LongTaskManagerImp(backoff, config, repository, logger);

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
	});

	describe("Claim Task", () => {
		it("Should handle an unexpected task claiming error.", () => {
			// 
		});

		it("Should decrement the available concurrency once a task is claimed.");
	});

	describe("Update Task", () => {
		// nothing to test...
		it("Should update progress for a processing task.");
	});

	describe("Complete Task", () => {
		it("Should be removed from processing when completed.");
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
		it("Should handle an unexpected get next task error.", () => {

		});
	});
	
});
