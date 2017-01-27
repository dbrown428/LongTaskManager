export type LongTaskProgress {
	readonly state: string | null;
	readonly currentStep: number | null;
	readonly maximumSteps: number | null;
}
