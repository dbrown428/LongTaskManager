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
		tracker.add(LongTaskId.withValue("123"));
		assert.equal(1, tracker.count());
	});

	it("should throw an exception when trying to remove a task id that doesn't exist.", () => {
		const tracker = new LongTaskTrackerArray;
		assert.throws(() => {
			tracker.remove(LongTaskId.withValue("123"));
		});
	});

	it("should remove a task id", () => {
		const identifier = LongTaskId.withValue("8");
		const tracker = new LongTaskTrackerArray;
		tracker.add(LongTaskId.withValue("5"));
		tracker.add(LongTaskId.withValue("10"));
		tracker.add(LongTaskId.withValue("1"));
		tracker.add(identifier);
		tracker.add(LongTaskId.withValue("3"));
		tracker.add(LongTaskId.withValue("9"));
		tracker.remove(identifier);
		assert.equal(5, tracker.count());
	});

	it("should list all tasks", () => {
		const tracker = new LongTaskTrackerArray;
		tracker.add(LongTaskId.withValue("5"));
		tracker.add(LongTaskId.withValue("10"));
		tracker.add(LongTaskId.withValue("1"));

		const result = tracker.list();
		assert.lengthOf(result, 3);
		assert.equal(result[0].value, 5);
		assert.equal(result[0].value, 10);
		assert.equal(result[0].value, 1);
	});
});
