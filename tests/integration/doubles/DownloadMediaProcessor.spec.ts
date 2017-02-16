import {assert} from "chai";
import {LongTask} from "../../../src/Domain/LongTask";
import {LongTaskId} from "../../../src/Domain/LongTaskId";
import {LongTaskManagerSpy} from "../../doubles/LongTaskManagerSpy";
import {LongTaskAttributes} from "../../../src/Domain/LongTaskAttributes";
import {DownloadMediaProcessor} from "../../doubles/DownloadMediaProcessor";

describe("Download media processor", () => {
	it("should notify the manager of progress and completion.", () => {
		const identifier = new LongTaskId("4");
		const attributes = LongTaskAttributes.withTypeParams("awesome-task", '{"students:[1,2,3]"}');
		const task = new LongTask(identifier, attributes);

		const managerSpy = new LongTaskManagerSpy;
		const httpClientSpy = new HttpClientSpy;
		const processor = new DownloadMediaProcessor(httpClientSpy);
		processor.execute(task, managerSpy);

		
		assert.equal(6, httpClientSpy.getCount());
		assert.equal(3, managerSpy.progressCount());
		assert.equal(1, managerSpy.completedCount());
	});

	it("should stop processing when the status changes to 'cancelled' by another party.", () => {

		// managerSpy = new LongTaskManagerSpy
		// after x progress calls, then the status changes to "cancelled"

		assert.equal(4, httpClientSpy.getCount());
		assert.equal(2, managerSpy.progressCount());
		// expecting an exception on the 4th progress count.
		assert.equal(0, managerSpy.completedCount());
	});

	it("should stop processing when the status changes to 'deleted' by another party.", () => {
		
		// managerSpy = new LongTaskManagerSpy
		// after x progress calls, then the status changes to "deleted"

		assert.equal(2, httpClientSpy.getCount());
		assert.equal(1, managerSpy.progressCount());
		assert.equal(0, managerSpy.completedCount());
	});
});
