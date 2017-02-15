import {LongTaskStatus} from "./LongTaskAttributes";

// implements validator.

export class LongTaskStatusChangeValidator {
	private message: string = "";

	public failureMessage(): string {
		return this.message;
	}

	public isInvalidStatusUpdate(existingStatus: LongTaskStatus, newStatus: LongTaskStatus): boolean {
		return ( ! this.isValidStatusUpdate(existingStatus, newStatus));
	}

	public isValidStatusUpdate(existingStatus: LongTaskStatus, newStatus: LongTaskStatus): boolean {
		this.message = "";
		
		if (existingStatus == LongTaskStatus.Cancelled) {
			return this.cannotChangeCancelledStatus();
		} else if (existingStatus == LongTaskStatus.Completed) {
			return this.cannotChangeCompletedStatus();
		} else if (existingStatus == LongTaskStatus.Failed) {
			return this.isValidFailedStatusChange(newStatus);
		} else if (existingStatus == LongTaskStatus.Queued) {
			return this.isValidQueuedStatusChange(newStatus);
		} else if (existingStatus == LongTaskStatus.Processing) {
			return this.isValidProcessingStatusChange(newStatus);
		} else {
			return true;
		}
	}

	private cannotChangeCancelledStatus(): boolean {
		this.message = "You cannot change the status of a cancelled task.";
		return false;
	}

	private cannotChangeCompletedStatus(): boolean {
		this.message = "You cannot change the status of a completed task.";
		return false;
	}

	private isValidFailedStatusChange(newStatus: LongTaskStatus): boolean {
		const valid = (newStatus == LongTaskStatus.Queued);

		if ( ! valid) {
			this.message = "You can only change a failed task status to 'queued'.";
		}

		return valid;
	}

	private isValidQueuedStatusChange(newStatus: LongTaskStatus): boolean {
		const isProcessing = newStatus == LongTaskStatus.Processing;
		const isCancelled = newStatus == LongTaskStatus.Cancelled;
		const valid = (isProcessing || isCancelled);

		if ( ! valid) {
			this.message = "You can only change a queued status to 'processing' or 'cancelled'.";
		}

		return valid;
	}

	private isValidProcessingStatusChange(newStatus: LongTaskStatus): boolean {
		const valid = (newStatus != LongTaskStatus.Queued);

		if ( ! valid) {
			this.message = "You cannot change a processing task to queued.";
		}

		return valid;
	}
}
