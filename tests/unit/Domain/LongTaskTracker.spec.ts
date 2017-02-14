import {assert} from "chai";
import {LongTaskId} from "../../../src/Domain/LongTaskId";
import {LongTaskTrackerArray} from "../../../src/Domain/LongTaskTrackerArray";

describe("Long Task Tracker", () => {
	it("should have a zero count when empty.", () => {
		const tracker = new LongTaskTrackerArray;
		assert.equal(0, tracker.count());
	});

	it("should add a task id", () => {
		const tracker = new LongTaskTrackerArray;
		tracker.add(new LongTaskId("123"));
		assert.equal(1, tracker.count());
	});

	it("should throw an exception when trying to remove a task id that doesn't exist.", () => {
		const tracker = new LongTaskTrackerArray;
		assert.throws(() => {
			tracker.remove(new LongTaskId("123"));
		});
	});

	it("should remove a task id", () => {
		const identifier = new LongTaskId("8");
		const tracker = new LongTaskTrackerArray;
		tracker.add(new LongTaskId("5"));
		tracker.add(new LongTaskId("10"));
		tracker.add(new LongTaskId("1"));
		tracker.add(identifier);
		tracker.add(new LongTaskId("3"));
		tracker.add(new LongTaskId("9"));
		tracker.remove(identifier);
		assert.equal(5, tracker.count());
	});
});
