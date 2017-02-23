export class UserId {
	public static withValue(value: string): UserId {
		return new UserId(value);
	}
	
	private constructor(readonly value: string) {}
}
