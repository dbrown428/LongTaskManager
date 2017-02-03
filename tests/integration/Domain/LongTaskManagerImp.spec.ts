import {assert} from "chai";
import {Promise} from "es6-promise";

describe("Long task manager", () => {
	describe("Add Task", () => {
		it("Should reset the backoff and schedule processing.");
	});

	describe("Claim Task", () => {
		it("Should handle an unexpected task claiming error.");
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
