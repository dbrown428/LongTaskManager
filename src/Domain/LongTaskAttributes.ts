import {LongTaskProgress} from "./LongTaskProgress";

export enum LongTaskStatus {
	Queued = 1,
	Processing,
	Failed,
	Completed,
	Cancelled
}

export class LongTaskAttributes {
	constructor(
		readonly type: string, 
		readonly params: string, 
		readonly status: LongTaskStatus, 
		readonly progress: LongTaskProgress,
		readonly claim: number | null,
	) {}
}
