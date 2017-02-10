import {assert} from "chai";
import {Promise} from "es6-promise";
import {LongTask} from "../../../src/Domain/LongTask";
import {LongTaskId} from "../../../src/Domain/LongTaskId";
import {LongTaskProgress} from "../../../src/Domain/LongTaskProgress";
import {LongTaskStatus, LongTaskAttributes} from "../../../src/Domain/LongTaskAttributes";

describe("Long Task", () => {
	it("should be unclaimed for empty claim values", () => {
		const identifier = new LongTaskId("5");
		const attributes = new LongTaskAttributes(
			"sweet-task", 
			"{students:[1,2,3]}",
			LongTaskStatus.Processing,
			LongTaskProgress.none(),
			null
		);
		const task = new LongTask(identifier, attributes);

		assert.isFalse(task.isClaimed());
	});

	it("should be claimed for a set claim value", () => {
		const identifier = new LongTaskId("5");
		const attributes = new LongTaskAttributes(
			"sweet-task", 
			"{students:[1,2,3]}",
			LongTaskStatus.Processing,
			LongTaskProgress.none(),
			7361718282
		);
		const task = new LongTask(identifier, attributes);

		assert.isTrue(task.isClaimed());
	});

	it("should be immutable", () => {
		const identifier = new LongTaskId("5");
		const type = "sweet-task";
		const params = "{students:[1,2,3, 4]}";
		const status = LongTaskStatus.Processing;
		const state = "{completed:[1,2], failed:[3]}";
		const step = 12;
		const maxSteps = 16;
		const progress = LongTaskProgress.withStateCurrentStepAndMaximumSteps(state, step, maxSteps);
		const claim = 7361718282;
		const attributes = new LongTaskAttributes(type, params, status, progress, claim);
		const task = new LongTask(identifier, attributes);

		assert.equal(task.type(), type);
		assert.equal(task.params(), params);
		assert.equal(task.progressState(), state);
		assert.equal(task.progressCurrentStep(), step);
		assert.equal(task.progressMaximumSteps(), maxSteps);
	});

	it("should be easy to get the status", () => {
		const identifier = new LongTaskId("5");
		const attributes = new LongTaskAttributes(
			"sweet-task", 
			"{students:[1,2,3]}",
			LongTaskStatus.Processing,
			LongTaskProgress.none(),
			7361718282
		);
		const task = new LongTask(identifier, attributes);

		assert.isTrue(task.isProcessing());
		assert.isFalse(task.isCompleted());
		assert.isFalse(task.isQueued());
		assert.isFalse(task.isFailed());
		assert.isFalse(task.isCancelled());
	});
});
