export class LongTaskClaim {
	public static withNowTimestamp(): LongTaskClaim {
		const now = Date.now();
		return new LongTaskClaim(now);
	}

	public static withExistingTimestamp(timestamp: number): LongTaskClaim {
		const length = timestamp.toString().length;
		if (length < 13) {
			throw new RangeError("Expecting a timestamp value. This looks a bit short.");
		} else {
			return new LongTaskClaim(timestamp);
		}
	}
	
	private constructor(readonly value: number) {}
}
