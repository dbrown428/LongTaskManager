export class LongTaskId {
	public static withValue(value: string): LongTaskId {
		return new LongTaskId(value);
	}
	
	private constructor(readonly value: string) {}
}
