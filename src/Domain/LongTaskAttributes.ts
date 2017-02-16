import {LongTaskProgress} from "./LongTaskProgress";

// this would be better as a class... then we can do stuff like status.isFailed()?
export enum LongTaskStatus {
	Queued = 1,
	Processing,
	Failed,
	Completed,
	Cancelled
}

export class LongTaskAttributes {
	public static withTypeParamsStatusProgressClaim(type: string, params: string, status: LongTaskStatus, progress: LongTaskProgress, claim: number | null): LongTaskAttributes {
		return new LongTaskAttributes(type, params, status, progress, claim);
	}

	private constructor(
		readonly type: string, 
		readonly params: string, 
		readonly status: LongTaskStatus, 
		readonly progress: LongTaskProgress,
		readonly claim: number | null,
	) {}

	public static withTypeParams(type: string, params: string): LongTaskAttributes {
		const claim = null;
		const status = LongTaskStatus.Queued;
		const progress = LongTaskProgress.none();
		return new LongTaskAttributes(type, params, status, progress, claim);
	}
}
