export class LongTaskType {
	public static withValue(value: string): LongTaskType {
		return new LongTaskType(value);
	}

	private constructor(readonly value: string) {}
}
