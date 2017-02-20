import {HttpClient} from "./HttpClient";
import {LongTask} from "../../src/Domain/LongTask";
import {DownloadMediaState} from "./DownloadMediaState";
import {LongTaskManager} from "../../src/Domain/LongTaskManager";
import {DownloadMediaParameters} from "./DownloadMediaParameters";
import {LongTaskProgress} from "../../src/Domain/LongTaskProgress";
import {LongTaskProcessor} from "../../src/Domain/LongTaskProcessor";

// Rename the "doubles" directory to "example"
// todo

export class DownloadMediaProcessor implements LongTaskProcessor {
	private stepsPerItem = 2;	// arbitrary value for demonstration purposes.

	constructor(readonly httpClient: HttpClient) {}
	
	public execute(task: LongTask, manager: LongTaskManager): Promise <void> {
		console.log("Executing Task Processor...");

		// Depending on the type of task, it might make sense to retrieve the task status
		// before processing to verify the task hasn't been cancelled or deleted.

		const taskId = task.identifier;
		const jsonParams = task.params();
		
		const params = DownloadMediaParameters.withJson(jsonParams);
		const maximumSteps = params.items.length * this.stepsPerItem;
		
		const currentState = DownloadMediaState.withJson(task.progressState());
		const itemsToBeProcessed = currentState.diff(params.items);
		var currentStep = currentState.count() * this.stepsPerItem;

		return new Promise <void> (async (resolve, reject) => {
			console.log("Processing list...");

			try {
				for (var i = 0; i < itemsToBeProcessed.length; i++) {
					const url = itemsToBeProcessed[i];
					console.log("Downloading '" + url + "'");

					// process(url)
					// cleanup this mess...

					let response;

					// Continue processing the list on individual item failures.
					try {
						currentStep += 1;
						response = await this.httpClient.get(url);
					} catch (error) {
						currentState.addToFailed(url, error);
						console.log("item failed '" + url + "'");
						continue;
					}

					// Do something with the response.
					currentStep += 1;
					console.log("Response: " + response);

					currentState.addToSuccess(url);
					console.log("success '" + url + "'");

					const state = currentState.toJson();
					const progress = LongTaskProgress.withStateCurrentStepAndMaximumSteps(state, currentStep, maximumSteps);
					
					console.log("Updating task progress");
					await manager.updateTaskProgress(taskId, progress);
				}

				console.log("Completed task");
				const state = currentState.toJson();
				const progress = LongTaskProgress.withStateCurrentStepAndMaximumSteps(state, currentStep, maximumSteps);
				
				await manager.completedTask(taskId, progress);
				resolve();

			} catch (error) {
				console.log("Major failure: " + error);
				reject(error);
			}
		});
	}
}
