import {LongTaskInfo} from "../../src/Domain/LongTaskInfo";
import {MultipleItemsLongTaskState} from "./MultipleItemsLongTaskState";
import {LongTaskManager} from "../../src/Domain/LongTaskManager";
import {MultipleItemsLongTaskParameters} from "./MultipleItemsLongTaskParameters";
import {LongTaskProgress} from "../../src/Domain/LongTaskProgress";
import {LongTask} from "../../src/Domain/LongTask";

export class MultipleItemsLongTask implements LongTask {
	public async tick(task: LongTaskInfo, manager: LongTaskManager): Promise <void> {
        const taskId = task.identifier;
        const jsonParams = task.params();
        const params = MultipleItemsLongTaskParameters.withJson(jsonParams);
        const inputJsonState = task.progressState();
        const state = MultipleItemsLongTaskState.withJson(inputJsonState);

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
