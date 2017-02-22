/**
 * This is a completely ficticious class, and is only for demonstration purposes.
 * It showcases several async/await patterns, multiple steps per item being processed,
 * try/catches for update task progress and task completion.
 *
 * Depending on the type of task, it might make sense to retrieve the task status
 * before processing to verify the task hasn't been cancelled or deleted. In this example,
 * we optimisically try to update the task progress and completion, then just catch the
 * exceptions, if any.
 *
 * Depending on how quickly your steps complete, you might want to define item batches so
 * you're not hammering the manager with updates. Eg. complete 100 items, then update.
 */

import {HttpClient} from "./HttpClient";
import {LongTask} from "../../src/Domain/LongTask";
import {ImageManipulator} from "./ImageManipulator";
import {DownloadMediaState} from "./DownloadMediaState";
import {LongTaskManager} from "../../src/Domain/LongTaskManager";
import {DownloadMediaParameters} from "./DownloadMediaParameters";
import {LongTaskProgress} from "../../src/Domain/LongTaskProgress";
import {LongTaskProcessor} from "../../src/Domain/LongTaskProcessor";

export class DownloadMediaProcessor implements LongTaskProcessor {
	private currentStep: number;
	private httpClient: HttpClient;
	private state: DownloadMediaState;
	private manipulator: ImageManipulator;
	private stepsPerItem = 2;	// arbitrary value for demonstration purposes.

	constructor(httpClient: HttpClient, manipulator: ImageManipulator) {
		this.httpClient = httpClient;
		this.manipulator = manipulator;
	}
	
	// The goal is not to process the entire set of items. Do one step, or a batch of steps. Update the manager, then die.
	// The manager will then requeue the task.
	// If all the steps have been completed then report "completed" to the manager.
	public tick(task: LongTask, manager: LongTaskManager): Promise <void> {
		console.log("DownloadMediaProcessor is processing '" + task.identifier.value + "'");
		this.state = DownloadMediaState.withJson(task.progressState());
		this.currentStep = this.state.count() * this.stepsPerItem;

		// REDO THIS SO we are processing a step or a batch of steps, then terminating.
		// check if we are completed. How many items need to be processed?

		return new Promise <void> (async (resolve, reject) => {
			try {
				await this.processTask(task, manager);
				console.log("Completed Task");
				resolve();
			} catch (error) {
				console.log("Major failure occurred: " + error);
				reject(error);
			}
		});
	}

	private async processTask(task: LongTask, manager: LongTaskManager): Promise <void> {
		const taskId = task.identifier;
		const jsonParams = task.params();
		const params = DownloadMediaParameters.withJson(jsonParams);
		const maximumSteps = params.items.length * this.stepsPerItem;
		const itemsToBeProcessed = this.state.diff(params.items);

		console.log("Processing list...");

		for (var i = 0; i < itemsToBeProcessed.length; i++) {
			const url = itemsToBeProcessed[i];
			console.log("Downloading '" + url + "'");

			let response;

			// First Step: Continue processing the list on failure.
			// ============================================================
			try {
				this.currentStep += 1;
				response = await this.httpClient.get(url);
			} catch (error) {
				this.state.addToFailed(url, error);
				continue;
			}

			// Second Step: Stop processing the list on failure.
			// ============================================================
			try {
				this.currentStep += 1;
				await this.manipulator.resizeAndCropMedia(response, 400, 900);
				this.state.addToSuccess(url);
			} catch (error) {
				this.state.addToFailed(url, error);
				throw error;
			}

			// Notify the manager of task progress.
			// ============================================================
			const stateJson = this.state.toJson();
			const progress = LongTaskProgress.withStateCurrentStepAndMaximumSteps(stateJson, this.currentStep, maximumSteps);
			await manager.updateTaskProgress(taskId, progress);
		}


		// MOVE THIS... this needs to be on a conditional.
		// TODO
		console.log("Completed List");

		// Notify the manager of task completion.
		// ============================================================
		const stateJson = this.state.toJson();
		const progress = LongTaskProgress.withStateCurrentStepAndMaximumSteps(stateJson, this.currentStep, maximumSteps);
		await manager.completedTask(taskId, progress);

		return Promise.resolve();
	}
}
