import {LongTask} from "../../src/Domain/LongTask";
import {MultipleItemsState} from "./MultipleItemsState";
import {LongTaskManager} from "../../src/Domain/LongTaskManager";
import {MultipleItemsParameters} from "./MultipleItemsParameters";
import {LongTaskProgress} from "../../src/Domain/LongTaskProgress";
import {LongTaskProcessor} from "../../src/Domain/LongTaskProcessor";

export class MultipleItemsProcessor implements LongTaskProcessor {
	public async tick(task: LongTask, manager: LongTaskManager): Promise <void> {
        const taskId = task.identifier;
        const jsonParams = task.params();
        const params = MultipleItemsParameters.withJson(jsonParams);
        const inputJsonState = task.progressState();
        const state = MultipleItemsState.withJson(inputJsonState);

        const currentIndex = state.processedCount();
        const stepsPerTick = 1;
        const currentStep = currentIndex * stepsPerTick;
        const maximumSteps = params.items.length * stepsPerTick;
        const isLastItem = (currentIndex == params.items.length);

        if (currentIndex < params.items.length) {
            const item = params.items[currentIndex];
            state.addToCompleted(item);
        }

        const outputJsonState = state.toJson();
        const progress = LongTaskProgress.withStateCurrentStepAndMaximumSteps(outputJsonState, currentStep, maximumSteps);

        if (isLastItem) {
            await manager.completedTask(taskId, progress);
        } else {
            await manager.updateTaskProgress(taskId, progress);
        }

		return Promise.resolve();
	}
}
