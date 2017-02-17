import {HttpClient} from "./HttpClient";
import {LongTask} from "../../src/Domain/LongTask";
import {DownloadMediaState} from "./DownloadMediaState";
import {LongTaskManager} from "../../src/Domain/LongTaskManager";
import {DownloadMediaParameters} from "./DownloadMediaParameters";
import {LongTaskProgress} from "../../src/Domain/LongTaskProgress";
import {LongTaskProcessor} from "../../src/Domain/LongTaskProcessor";

export class DownloadMediaProcessor implements LongTaskProcessor {
	constructor(readonly httpClient: HttpClient) {}
	
	// should this be a fire-and-forget?
	public async execute(task: LongTask, manager: LongTaskManager): Promise <void> {
		console.log("Executing Task Processor...");

		// Depending on the type of task, it might make sense to retrieve the task status
		// before processing to verify the task hasn't been cancelled or deleted.

		const taskId = task.identifier;
		const jsonParams = task.params();
		const stepsPerItem = 2;	// arbitrary value for demonstration purposes.
		const params = DownloadMediaParameters.withJson(jsonParams);
		const maximumSteps = params.items.length * stepsPerItem;
		
		const currentState = DownloadMediaState.withJson(task.progressState());
		const itemsToBeProcessed = currentState.diff(params.items);
		var currentStep = currentState.count() * stepsPerItem;

		return new Promise <void> ((resolve, reject) => {

			// this isn't working how I expected with the await stuff.
			itemsToBeProcessed.map(async (url: string, index: number) => {
				console.log("Downloading '" + url + "'")

				// For demo purposes only, download each item twice.
				for (var i = 0; i < stepsPerItem; i++) {
					currentStep += 1;

					try {
						// not sure why the "await" is not needed, but the compiler complaied when it was present.
						const data = await this.httpClient.get(url);
						currentState.addToSuccess(url);
						console.log("success");
					} catch (error) {
						currentState.addToFailed(url, error);
						console.log("failed");
					}
				}

				const state = currentState.toJson();
				const progress = LongTaskProgress.withStateCurrentStepAndMaximumSteps(state, currentStep, maximumSteps);
				
				// It's possible the task was cancelled or deleted and will throw an exception if we try to update it.
				try {
					// will this await be needed?
					await manager.updateTaskProgress(taskId, progress);

				} catch (error) {
					// Need more resolution on the exception types... 
					// What's the error? If it's a status change exception (TaskCompletedException)
					// then we need to terminate the task. Otherwise we can log it and continue on.
					
					reject(error);
				}
			});


			// 
			// await manager.completedTask(taskId, progress);

			resolve();
		});
	}
}
