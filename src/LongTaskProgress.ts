export class LongTaskProgress {
	public static none(): LongTaskProgress {
		return new LongTaskProgress(null, null, null);
	}

	private constructor(
		readonly state: string | null, 	// this should be an array of any.
		readonly currentStep: number | null, 
		readonly maximumSteps: number | null
	) {}

	public static withStateCurrentStepAndMaximumSteps(state: string | null, currentStep: number | null, maximumSteps: number | null): LongTaskProgress {
		return new LongTaskProgress(state, currentStep, maximumSteps);
	}
}
