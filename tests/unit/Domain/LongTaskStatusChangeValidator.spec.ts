import {assert} from "chai";
import {LongTaskStatus} from "../../../src/Domain/LongTaskAttributes";
import {LongTaskStatusChangeValidator} from "../../../src/Domain/LongTaskStatusChangeValidator";

describe("Long task status change validator", () => {
	describe("Current status is Cancelled", () => {
		it("should fail validation when changing the status to queued.", () => {
			const currentStatus = LongTaskStatus.Cancelled;
			const newStatus = LongTaskStatus.Queued;
			const validator = new LongTaskStatusChangeValidator;
			const valid = validator.isValidStatusUpdate(currentStatus, newStatus);
			assert.isFalse(valid);
		});

		it("should fail validation when changing the status to processing.", () => {
			const currentStatus = LongTaskStatus.Cancelled;
			const newStatus = LongTaskStatus.Processing;
			const validator = new LongTaskStatusChangeValidator;
			const valid = validator.isValidStatusUpdate(currentStatus, newStatus);
			assert.isFalse(valid);
		});

		it("should fail validation when changing the status to failed.", () => {
			const currentStatus = LongTaskStatus.Cancelled;
			const newStatus = LongTaskStatus.Failed;
			const validator = new LongTaskStatusChangeValidator;
			const valid = validator.isValidStatusUpdate(currentStatus, newStatus);
			assert.isFalse(valid);
		});

		it("should fail validation when changing the status to completed.", () => {
			const currentStatus = LongTaskStatus.Cancelled;
			const newStatus = LongTaskStatus.Completed;
			const validator = new LongTaskStatusChangeValidator;
			const valid = validator.isValidStatusUpdate(currentStatus, newStatus);
			assert.isFalse(valid);
		});

		it("should fail validation when changing the status to cancelled.", () => {
			const currentStatus = LongTaskStatus.Cancelled;
			const newStatus = LongTaskStatus.Cancelled;
			const validator = new LongTaskStatusChangeValidator;
			const valid = validator.isValidStatusUpdate(currentStatus, newStatus);
			assert.isFalse(valid);
		});
	});

	describe("Current status is Completed", () => {
		it("should fail validation when changing the status to queued.", () => {
			const currentStatus = LongTaskStatus.Completed;
			const newStatus = LongTaskStatus.Queued;
			const validator = new LongTaskStatusChangeValidator;
			const valid = validator.isValidStatusUpdate(currentStatus, newStatus);
			assert.isFalse(valid);
		});

		it("should fail validation when changing the status to processing.", () => {
			const currentStatus = LongTaskStatus.Completed;
			const newStatus = LongTaskStatus.Processing;
			const validator = new LongTaskStatusChangeValidator;
			const valid = validator.isValidStatusUpdate(currentStatus, newStatus);
			assert.isFalse(valid);
		});

		it("should fail validation when changing the status to failed.", () => {
			const currentStatus = LongTaskStatus.Completed;
			const newStatus = LongTaskStatus.Failed;
			const validator = new LongTaskStatusChangeValidator;
			const valid = validator.isValidStatusUpdate(currentStatus, newStatus);
			assert.isFalse(valid);
		});

		it("should fail validation when changing the status to completed.", () => {
			const currentStatus = LongTaskStatus.Completed;
			const newStatus = LongTaskStatus.Completed;
			const validator = new LongTaskStatusChangeValidator;
			const valid = validator.isValidStatusUpdate(currentStatus, newStatus);
			assert.isFalse(valid);
		});

		it("should fail validation when changing the status to cancelled.", () => {
			const currentStatus = LongTaskStatus.Completed;
			const newStatus = LongTaskStatus.Cancelled;
			const validator = new LongTaskStatusChangeValidator;
			const valid = validator.isValidStatusUpdate(currentStatus, newStatus);
			assert.isFalse(valid);
		});
	});

	describe("Current status is Failed", () => {
		it("should pass validation when changing the status to queued.", () => {
			const currentStatus = LongTaskStatus.Failed;
			const newStatus = LongTaskStatus.Queued;
			const validator = new LongTaskStatusChangeValidator;
			const valid = validator.isValidStatusUpdate(currentStatus, newStatus);
			assert.isTrue(valid);
		});

		it("should fail validation when changing the status to processing.", () => {
			const currentStatus = LongTaskStatus.Failed;
			const newStatus = LongTaskStatus.Processing;
			const validator = new LongTaskStatusChangeValidator;
			const valid = validator.isValidStatusUpdate(currentStatus, newStatus);
			assert.isFalse(valid);
		});

		it("should fail validation when changing the status to failed.", () => {
			const currentStatus = LongTaskStatus.Failed;
			const newStatus = LongTaskStatus.Failed;
			const validator = new LongTaskStatusChangeValidator;
			const valid = validator.isValidStatusUpdate(currentStatus, newStatus);
			assert.isFalse(valid);
		});

		it("should fail validation when changing the status to completed.", () => {
			const currentStatus = LongTaskStatus.Failed;
			const newStatus = LongTaskStatus.Completed;
			const validator = new LongTaskStatusChangeValidator;
			const valid = validator.isValidStatusUpdate(currentStatus, newStatus);
			assert.isFalse(valid);
		});

		it("should fail validation when changing the status to Cancelled.", () => {
			const currentStatus = LongTaskStatus.Failed;
			const newStatus = LongTaskStatus.Cancelled;
			const validator = new LongTaskStatusChangeValidator;
			const valid = validator.isValidStatusUpdate(currentStatus, newStatus);
			assert.isFalse(valid);
		});
	});

	describe("Current status is Queued", () => {
		it("should fail validation when changing the status to failed.", () => {
			const currentStatus = LongTaskStatus.Queued;
			const newStatus = LongTaskStatus.Failed;
			const validator = new LongTaskStatusChangeValidator;
			const valid = validator.isValidStatusUpdate(currentStatus, newStatus);
			assert.isFalse(valid);
		});

		it("should fail validation when changing the status to completed.", () => {
			const currentStatus = LongTaskStatus.Queued;
			const newStatus = LongTaskStatus.Completed;
			const validator = new LongTaskStatusChangeValidator;
			const valid = validator.isValidStatusUpdate(currentStatus, newStatus);
			assert.isFalse(valid);
		});

		it("should fail validation when changing the status to queued again.", () => {
			const currentStatus = LongTaskStatus.Queued;
			const newStatus = LongTaskStatus.Queued;
			const validator = new LongTaskStatusChangeValidator;
			const valid = validator.isValidStatusUpdate(currentStatus, newStatus);
			assert.isFalse(valid);
		});

		it("should pass validation when changing the status to processing.", () => {
			const currentStatus = LongTaskStatus.Queued;
			const newStatus = LongTaskStatus.Processing;
			const validator = new LongTaskStatusChangeValidator;
			const valid = validator.isValidStatusUpdate(currentStatus, newStatus);
			assert.isTrue(valid);
		});

		it("should pass validation when changing the status to cancelled.", () => {
			const currentStatus = LongTaskStatus.Queued;
			const newStatus = LongTaskStatus.Cancelled;
			const validator = new LongTaskStatusChangeValidator;
			const valid = validator.isValidStatusUpdate(currentStatus, newStatus);
			assert.isTrue(valid);
		});
	});

	describe("Current status is Processing", () => {
		it("should pass validation when changing the status to queued.", () => {
			const currentStatus = LongTaskStatus.Processing;
			const newStatus = LongTaskStatus.Queued;
			const validator = new LongTaskStatusChangeValidator;
			const valid = validator.isValidStatusUpdate(currentStatus, newStatus);
			assert.isTrue(valid);
		});

		it("should pass validation when changing status to processing", () => {
			const currentStatus = LongTaskStatus.Processing;
			const newStatus = LongTaskStatus.Processing;
			const validator = new LongTaskStatusChangeValidator;
			const valid = validator.isValidStatusUpdate(currentStatus, newStatus);
			assert.isTrue(valid);
		});

		it("should pass validation when changing status to failed", () => {
			const currentStatus = LongTaskStatus.Processing;
			const newStatus = LongTaskStatus.Failed;
			const validator = new LongTaskStatusChangeValidator;
			const valid = validator.isValidStatusUpdate(currentStatus, newStatus);
			assert.isTrue(valid);
		});

		it("should pass validation when changing status to completed", () => {
			const currentStatus = LongTaskStatus.Processing;
			const newStatus = LongTaskStatus.Completed;
			const validator = new LongTaskStatusChangeValidator;
			const valid = validator.isValidStatusUpdate(currentStatus, newStatus);
			assert.isTrue(valid);
		});

		it("should pass validation when changing status to cancelled", () => {
			const currentStatus = LongTaskStatus.Processing;
			const newStatus = LongTaskStatus.Cancelled;
			const validator = new LongTaskStatusChangeValidator;
			const valid = validator.isValidStatusUpdate(currentStatus, newStatus);
			assert.isTrue(valid);
		});
	});

	describe("Failure message", () => {
		it("should be empty if accessed before validation.", () => {
			const validator = new LongTaskStatusChangeValidator;
			assert.equal("", validator.failureMessage());
		});

		it("should be an empty string when validation passes.", () => {
			const validator = new LongTaskStatusChangeValidator;
			const valid = validator.isValidStatusUpdate(LongTaskStatus.Queued, LongTaskStatus.Processing);
			assert.isTrue(valid);
			assert.equal("", validator.failureMessage());
		});

		it("should have a message when validation fails.", () => {
			const validator = new LongTaskStatusChangeValidator;
			const valid = validator.isValidStatusUpdate(LongTaskStatus.Queued, LongTaskStatus.Failed);
			assert.isFalse(valid);
			assert.notEqual("", validator.failureMessage());
		});
	});
});
