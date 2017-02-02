export class ClaimId {
	public static withNowTimestamp(): ClaimId {
		const now = Date.now();
		return new ClaimId(now);
	}
	
	private constructor(readonly value: number) {}
}
