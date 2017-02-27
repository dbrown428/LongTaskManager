import {assert} from "chai";

import {HttpClientSpy} from "../../demo/FGSystem/HttpClient/HttpClientSpy";
import {DownloadMediaLongTask} from "../../demo/DownloadMedia/DownloadMediaLongTask";
import {ImageManipulatorDummy} from "../../demo/FGSystem/ImageManipulator/ImageManipulatorDummy";
import {HttpClientOddRequestFailures} from "../../demo/FGSystem/HttpClient/HttpClientOddRequestFailures";

import {LongTaskId} from "../../src/Domain/LongTaskId";
import {LoggerSpy} from "../../src/Shared/Log/LoggerSpy";
import {LongTaskInfo} from "../../src/Domain/LongTaskInfo";
import {LongTaskManagerSpy} from "../doubles/LongTaskManagerSpy";
import {LongTaskProgress} from "../../src/Domain/LongTaskProgress";
import {LongTaskManagerMock} from "../doubles/LongTaskManagerMock";
import {LongTaskStatus, LongTaskAttributes} from "../../src/Domain/LongTaskAttributes";
import {LongTaskManagerFailToUpdateProgressDummy} from "../doubles/LongTaskManagerFailToUpdateProgressDummy";

describe("Download media long task", () => {
	it("should notify the manager of progress at the end of a tick.", async () => {
		const identifier = LongTaskId.withValue("4");
		const attributes = LongTaskAttributes.withTypeParams("awesome-task", '{"items":[1,2,3]}');
		const taskInfo = new LongTaskInfo(identifier, attributes);

		const logger = new LoggerSpy;
		const managerSpy = new LongTaskManagerSpy;
		const httpClientSpy = new HttpClientSpy;
		const manipulatorDummy = new ImageManipulatorDummy;
		const longTask = new DownloadMediaLongTask(logger, httpClientSpy, manipulatorDummy);
		
		await longTask.tick(taskInfo, managerSpy);
		assert.equal(1, httpClientSpy.getCount());
		assert.equal(1, managerSpy.updateTaskProgressCount());
		assert.equal(0, managerSpy.completedTaskCount());
	});

	it("should notify the manager of completed progress at the end of the final tick.", async () => {
		const identifier = LongTaskId.withValue("4");
		const progress = LongTaskProgress.withStateCurrentStepAndMaximumSteps('{"success":[1,2,3],"failed":[]}', 6, 6);
		const attributes = LongTaskAttributes.withTypeParamsStatusProgressClaim("awesome-task", '{"items":[1,2,3]}', LongTaskStatus.Processing, progress, null);
		const taskInfo = new LongTaskInfo(identifier, attributes);

		const logger = new LoggerSpy;
		const managerSpy = new LongTaskManagerSpy;
		const httpClientSpy = new HttpClientSpy;
		const manipulatorDummy = new ImageManipulatorDummy;
		const longTask = new DownloadMediaLongTask(logger, httpClientSpy, manipulatorDummy);
		
		await longTask.tick(taskInfo, managerSpy);

		assert.equal(0, httpClientSpy.getCount());
		assert.equal(0, managerSpy.updateTaskProgressCount());
		assert.equal(1, managerSpy.completedTaskCount());
	});

	it("should stop processing when the status changes to 'cancelled'.", async () => {
		const identifier = LongTaskId.withValue("4");
		const attributes = LongTaskAttributes.withTypeParams("awesome-task", '{"items":[1,2,3]}');
		const taskInfo = new LongTaskInfo(identifier, attributes);

		const logger = new LoggerSpy;
		const managerDummy = new LongTaskManagerFailToUpdateProgressDummy;
		const httpClientSpy = new HttpClientSpy;
		const manipulatorDummy = new ImageManipulatorDummy;
		const longTask = new DownloadMediaLongTask(logger, httpClientSpy, manipulatorDummy);
		
		try {
			await longTask.tick(taskInfo, managerDummy);
		} catch (error) {
			assert.isNotNull(error);
		}
	});

	it("should stop when the completed task update fails.", async () => {
		const identifier = LongTaskId.withValue("4");
		const attributes = LongTaskAttributes.withTypeParams("awesome-task", '{"items":[1,2,3]}');
		const taskInfo = new LongTaskInfo(identifier, attributes);

		const managerMock = new LongTaskManagerMock;
		managerMock.setCompletedTaskToFail(true);

		const logger = new LoggerSpy;
		const httpClientSpy = new HttpClientSpy;
		const manipulatorDummy = new ImageManipulatorDummy;
		const longTask = new DownloadMediaLongTask(logger, httpClientSpy, manipulatorDummy);

		try {
			await longTask.tick(taskInfo, managerMock);
		} catch (error) {
			assert.isNotNull(error);
		}
	});

});
