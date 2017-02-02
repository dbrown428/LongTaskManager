export class LongTaskClaim {
	public static withNowTimestamp(): LongTaskClaim {
		const now = Date.now();
		return new LongTaskClaim(now);
	}
	
	private constructor(readonly value: number) {}
}
