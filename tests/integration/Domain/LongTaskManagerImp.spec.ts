import {assert} from "chai";
import {Promise} from "es6-promise";

describe("Long task manager", () => {

	// how many of these should be enforced on the repository layer?
	describe("Update Task", () => {
		it("Should result in an error if a cancelled task is updated.");
		it("Should result in an error if a failed task is updated.");
		it("Should result in an error if a completed task is updated.");
		it("Should result in an error if a queued task is updated.");
		it("Should update progress for a processing task.");
	});

	describe("Complete Task", () => {
		it("Should result in an error if a queued task is set to completed.");
		it("Should result in an error if a cancelled task is set to completed.");
		it("Should result in an error if a failed task is set as completed.");
		it("Should result in an error if a completed task is set as completed again.");
		it("Should update status to completed for a processing task.");
	});

	describe("Failed Task", () => {
		it("Should result in an error when setting a queued task to failed.");
		it("Should result in an error if a completed task is set as failed.");
		it("Should update status to failed for a processing task.");
	});

	describe("Cancel Task", () => {
		it("Should result in an error if the task does not exist.");
		it("Should cancel a queued task.");
		it("Should cancel a processing task.");
	});

	describe("Delete Task", () => {
		it("Should result in an error if the task does not exist.");
		it("Should delete a queued task.");
		it("Should delete a processing task.");
	});

	describe("Dependency failures", () => {
		it("Should handle an unexpected task claiming error.", () => {
			// - simulate an error when claiming a task. expecting it to be caught and logged.
		});

		it("Should handle an unexpected get next task error.", () => {

		});

		it("Should handle an unexpected completed task error.");
		it("Should ")

	});
	
});
