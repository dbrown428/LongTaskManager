import {assert} from "chai";
import {LongTask} from "../../../src/Domain/LongTask";
import {HttpClientSpy} from "../../doubles/HttpClientSpy";
import {LongTaskId} from "../../../src/Domain/LongTaskId";
import {LoggerSpy} from "../../../src/Shared/Log/LoggerSpy";
import {LongTaskManagerSpy} from "../../doubles/LongTaskManagerSpy";
import {LongTaskProgress} from "../../../src/Domain/LongTaskProgress";
import {LongTaskManagerMock} from "../../doubles/LongTaskManagerMock";
import {ImageManipulatorDummy} from "../../doubles/ImageManipulatorDummy";
import {DownloadMediaProcessor} from "../../doubles/DownloadMediaProcessor";
import {HttpClientOddRequestFailures} from "../../doubles/HttpClientOddRequestFailures";
import {LongTaskStatus, LongTaskAttributes} from "../../../src/Domain/LongTaskAttributes";
import {LongTaskManagerFailToUpdateProgressDummy} from "../../doubles/LongTaskManagerFailToUpdateProgressDummy";

describe("Download media processor", () => {
	it("should notify the manager of progress at the end of a tick.", async () => {
		const identifier = LongTaskId.withValue("4");
		const attributes = LongTaskAttributes.withTypeParams("awesome-task", '{"items":[1,2,3]}');
		const task = new LongTask(identifier, attributes);

		const logger = new LoggerSpy;
		const managerSpy = new LongTaskManagerSpy;
		const httpClientSpy = new HttpClientSpy;
		const manipulatorDummy = new ImageManipulatorDummy;
		const processor = new DownloadMediaProcessor(logger, httpClientSpy, manipulatorDummy);
		
		await processor.tick(task, managerSpy);
		assert.equal(1, httpClientSpy.getCount());
		assert.equal(1, managerSpy.updateTaskProgressCount());
		assert.equal(0, managerSpy.completedTaskCount());
	});

	it("should notify the manager of completed progress at the end of the final tick.", async () => {
		const identifier = LongTaskId.withValue("4");
		const progress = LongTaskProgress.withStateCurrentStepAndMaximumSteps('{"success":[1,2,3],"failed":[]}', 6, 6);
		const attributes = LongTaskAttributes.withTypeParamsStatusProgressClaim("awesome-task", '{"items":[1,2,3]}', LongTaskStatus.Processing, progress, null);
		const task = new LongTask(identifier, attributes);

		const logger = new LoggerSpy;
		const managerSpy = new LongTaskManagerSpy;
		const httpClientSpy = new HttpClientSpy;
		const manipulatorDummy = new ImageManipulatorDummy;
		const processor = new DownloadMediaProcessor(logger, httpClientSpy, manipulatorDummy);
		
		await processor.tick(task, managerSpy);

		assert.equal(0, httpClientSpy.getCount());
		assert.equal(0, managerSpy.updateTaskProgressCount());
		assert.equal(1, managerSpy.completedTaskCount());
	});

	it("should stop processing when the status changes to 'cancelled'.", async () => {
		const identifier = LongTaskId.withValue("4");
		const attributes = LongTaskAttributes.withTypeParams("awesome-task", '{"items":[1,2,3]}');
		const task = new LongTask(identifier, attributes);

		const logger = new LoggerSpy;
		const managerDummy = new LongTaskManagerFailToUpdateProgressDummy;
		const httpClientSpy = new HttpClientSpy;
		const manipulatorDummy = new ImageManipulatorDummy;
		const processor = new DownloadMediaProcessor(logger, httpClientSpy, manipulatorDummy);
		
		try {
			await processor.tick(task, managerDummy);
		} catch (error) {
			assert.isNotNull(error);
		}
	});

	it("should stop when the completed task update fails.", async () => {
		const identifier = LongTaskId.withValue("4");
		const attributes = LongTaskAttributes.withTypeParams("awesome-task", '{"items":[1,2,3]}');
		const task = new LongTask(identifier, attributes);

		const managerMock = new LongTaskManagerMock;
		managerMock.setCompletedTaskToFail(true);

		const logger = new LoggerSpy;
		const httpClientSpy = new HttpClientSpy;
		const manipulatorDummy = new ImageManipulatorDummy;
		const processor = new DownloadMediaProcessor(logger, httpClientSpy, manipulatorDummy);

		try {
			await processor.tick(task, managerMock);
		} catch (error) {
			assert.isNotNull(error);
		}
	});

});
