/**
 * This is a completely ficticious class, and is only for demonstration purposes.
 * It showcases several async/await patterns, multiple steps per tick being processed,
 * try/catches for update task progress and task completion.
 *
 * Depending on the type of task, it might make sense to retrieve the task status
 * before processing to verify the task hasn't been cancelled or deleted. In this example,
 * we optimisically try to update the task progress and completion, then just catch the
 * exceptions, if any.
 *
 * The goal is not to process the entire set of items. Do one step, or a batch of steps, per tick. 
 * Update the manager of progress, then die. The manager will then requeue the task for additional
 * ticks until all the steps have been completed.
 */
import {HttpClient} from "./HttpClient";
import {Logger} from "../../src/Shared/Log/Logger";
import {LongTask} from "../../src/Domain/LongTask";
import {ImageManipulator} from "./ImageManipulator";
import {DownloadMediaState} from "./DownloadMediaState";
import {LongTaskManager} from "../../src/Domain/LongTaskManager";
import {DownloadMediaParameters} from "./DownloadMediaParameters";
import {LongTaskProgress} from "../../src/Domain/LongTaskProgress";
import {LongTaskProcessor} from "../../src/Domain/LongTaskProcessor";

export class DownloadMediaProcessor implements LongTaskProcessor {
	private currentStep: number;
	private stepsPerTick: number = 2;
	private state: DownloadMediaState;

	constructor(
		private logger: Logger,
		private httpClient: HttpClient, 
		private manipulator: ImageManipulator
	) {}
	
	public async tick(task: LongTask, manager: LongTaskManager): Promise <void> {
		// start time - todo

		this.logger.info("DownloadMediaProcessor is processing task with ID '" + task.identifier.value + "'");
		this.state = DownloadMediaState.withJson(task.progressState());

		const taskId = task.identifier;
		const jsonParams = task.params();
		const params = DownloadMediaParameters.withJson(jsonParams);
		const currentIndex = this.state.processedCount();
		const maximumSteps = params.items.length * this.stepsPerTick;
		const isLastItem: boolean = (currentIndex == params.items.length);

		this.currentStep = currentIndex * this.stepsPerTick;
		this.logger.info("");

		if (currentIndex < params.items.length) {
			const url = params.items[currentIndex];

			try {
				await this.processUrl(url);
			} catch (error) {
				this.state.addToFailed(url, error);
				throw error;
			}
		}

		// end time - todo
		
		const stateJson = this.state.toJson();
		const progress = LongTaskProgress.withStateCurrentStepAndMaximumSteps(stateJson, this.currentStep, maximumSteps);

		if (isLastItem) {
			this.logger.info("Completed Task (" + this.currentStep + " of " + maximumSteps + " steps)");
			await manager.completedTask(taskId, progress);
		} else {
			this.logger.info("Updating Task Progress (" + this.currentStep + " of " + maximumSteps + " steps)");
			await manager.updateTaskProgress(taskId, progress);
		}

		return Promise.resolve();		
	}

	private async processUrl(url: string): Promise <void> {
		let response;

		// First Step
		// ============================================================
		this.currentStep += 1;
		this.logger.info("Step " + this.currentStep + ": Downloading '" + url + "'");
		response = await this.httpClient.get(url);

		// Second Step
		// ============================================================
		this.currentStep += 1;
		this.logger.info("Step " + this.currentStep + ": Manipulating downloaded image for '" + url + "'");
		await this.manipulator.resizeAndCropMedia(response, 400, 900);

		this.logger.info("Successfully processed '" + url + "'");
		this.state.addToSuccess(url);
		return Promise.resolve();
	}
}
