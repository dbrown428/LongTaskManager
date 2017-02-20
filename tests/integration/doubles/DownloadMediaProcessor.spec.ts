import {assert} from "chai";
import {LongTask} from "../../../src/Domain/LongTask";
import {HttpClientSpy} from "../../doubles/HttpClientSpy";
import {LongTaskId} from "../../../src/Domain/LongTaskId";
import {LongTaskManagerSpy} from "../../doubles/LongTaskManagerSpy";
import {LongTaskProgress} from "../../../src/Domain/LongTaskProgress";
import {LongTaskManagerMock} from "../../doubles/LongTaskManagerMock";
import {ImageManipulatorDummy} from "../../doubles/ImageManipulatorDummy";
import {LongTaskAttributes} from "../../../src/Domain/LongTaskAttributes";
import {DownloadMediaProcessor} from "../../doubles/DownloadMediaProcessor";
import {HttpClientOddRequestFailures} from "../../doubles/HttpClientOddRequestFailures";
import {LongTaskManagerFailToUpdateProgressDummy} from "../../doubles/LongTaskManagerFailToUpdateProgressDummy";

describe.only("Download media processor", () => {
	it("should notify the manager of progress and completion.", async () => {
		const identifier = new LongTaskId("4");
		const attributes = LongTaskAttributes.withTypeParams("awesome-task", '{"items":[1,2,3]}');
		const task = new LongTask(identifier, attributes);

		const managerSpy = new LongTaskManagerSpy;
		const httpClientSpy = new HttpClientSpy;
		const manipulatorDummy = new ImageManipulatorDummy;
		const processor = new DownloadMediaProcessor(httpClientSpy, manipulatorDummy);
		
		await processor.execute(task, managerSpy);
		assert.equal(3, httpClientSpy.getCount());
		assert.equal(3, managerSpy.updateTaskProgressCount());
		assert.equal(1, managerSpy.completedTaskCount());
	});

	it("should continue processing when step failures occur.", async () => {		
		const identifier = new LongTaskId("4");
		const attributes = LongTaskAttributes.withTypeParams("awesome-task", '{"items":[1,2,3]}');
		const task = new LongTask(identifier, attributes);

		// use a mocking library instead... TODO
		const managerMock = new LongTaskManagerMock;
		const progress = LongTaskProgress.withStateCurrentStepAndMaximumSteps('{"success":[2],"failed":[1,3]}', 3, 3);

		managerMock.expectingCompletedTaskProgressToEqual(progress);
		// sinonjs?
		// failure messages?

		const httpClient = new HttpClientOddRequestFailures;
		const manipulatorDummy = new ImageManipulatorDummy;
		const processor = new DownloadMediaProcessor(httpClient, manipulatorDummy);

		try {
			await processor.execute(task, managerMock);
		} catch (error) {
			assert.isNotNull(error);
		}
	});

	it("should stop processing when the status changes to 'cancelled'.", async () => {
		const identifier = new LongTaskId("4");
		const attributes = LongTaskAttributes.withTypeParams("awesome-task", '{"items":[1,2,3]}');
		const task = new LongTask(identifier, attributes);

		const managerDummy = new LongTaskManagerFailToUpdateProgressDummy;
		const httpClientSpy = new HttpClientSpy;
		const manipulatorDummy = new ImageManipulatorDummy;
		const processor = new DownloadMediaProcessor(httpClientSpy, manipulatorDummy);
		
		try {
			await processor.execute(task, managerDummy);
		} catch (error) {
			assert.isNotNull(error);
		}
	});

	it("should stop when the completed task update fails.", async () => {
		const identifier = new LongTaskId("4");
		const attributes = LongTaskAttributes.withTypeParams("awesome-task", '{"items":[1,2,3]}');
		const task = new LongTask(identifier, attributes);

		const managerMock = new LongTaskManagerMock;
		managerMock.setCompletedTaskToFail(true);

		const httpClientSpy = new HttpClientSpy;
		const manipulatorDummy = new ImageManipulatorDummy;
		const processor = new DownloadMediaProcessor(httpClientSpy, manipulatorDummy);

		try {
			await processor.execute(task, managerMock);
		} catch (error) {
			assert.isNotNull(error);
		}
	});

});
