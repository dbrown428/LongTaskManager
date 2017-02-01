export class ClaimId {
	readonly value: string;

	public static withNowTimestamp(): ClaimId {
		const date = Date.now();
		const now = date.toString();
		
		return new ClaimId(now);
	}
	
	private constructor(value: string) {
		this.value = value;
	}
}
