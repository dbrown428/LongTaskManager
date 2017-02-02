import {Promise} from "es6-promise";
import {LongTask} from "../../Domain/LongTask";
import {LongTaskManager} from "../../Domain/LongTaskManager";
import {LongTaskProgress} from "../../Domain/LongTaskProgress";
import {LongTaskProcessor} from "../../Domain/LongTaskProcessor";

export class PublishSummaryReportsTaskProcessor implements LongTaskProcessor {
	execute(task: LongTask, manager: LongTaskManager): void {
		
		// Determine the current progress of the task...
		// task.attributes.progress
		
		// try/catch…
		const params = JSON.parse(task.attributes.params);


		// split the task into steps.
		// calculate the maximum steps.
		// current step = 0;


		// completed the first batch... say 10 steps of 100 completed
		// Send a progress report to the task manager
		const state = "";	// should this be an array of values... or json string? Who's responsible for JSON serialize/deserializing this data?
		const currentStep = 10;
		const maximumSteps = 100;
		const progress = LongTaskProgress.withStateCurrentStepAndMaximumSteps(state, currentStep, maximumSteps);
		manager.update(task.identifier, progress).then();

		// do more steps, and finally finish...
		// taskManager.completed(taskId, progress);

		// Alternate...
		// taskManager.failed(taskId, reason)



	}
}
