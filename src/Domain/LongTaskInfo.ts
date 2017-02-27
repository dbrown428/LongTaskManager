import {LongTaskId} from "./LongTaskId";
import {LongTaskStatus, LongTaskAttributes} from "./LongTaskAttributes";

export class LongTaskInfo {
	constructor(
		readonly identifier: LongTaskId,
		private attributes: LongTaskAttributes
		// consider dropping the attributes, and just pulling in the needed items.
		// too much data in attributes.
	) {}

	public isClaimed(): boolean {
		return (this.attributes.claim !== null);
	}

	// add the searchKey functionality
	// - todo

	public type(): string {
		return this.attributes.type;
	}

	public params(): string {
		return this.attributes.params;
	}

	public isProcessing(): boolean {
		return (this.attributes.status == LongTaskStatus.Processing);
	}

	public isCompleted(): boolean {
		return (this.attributes.status == LongTaskStatus.Completed);
	}

	public isQueued(): boolean {
		return (this.attributes.status == LongTaskStatus.Queued);
	}

	public isFailed(): boolean {
		return (this.attributes.status == LongTaskStatus.Failed);
	}

	public isCancelled(): boolean {
		return (this.attributes.status == LongTaskStatus.Cancelled);
	}
	
	public progressState(): string | null {
		return this.attributes.progress.state;
	}

	public progressCurrentStep(): number | null {
		return this.attributes.progress.currentStep;
	}
	
	public progressMaximumSteps(): number | null {
		return this.attributes.progress.maximumSteps;
	}
}
