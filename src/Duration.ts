export class Duration {
	static readonly millisecondsPerSecond = 1000;

	public static withSeconds(value: number): Duration {
		const milliseconds = value * Duration.millisecondsPerSecond;
		return new Duration(milliseconds);
	}

	public static withMilliseconds(value: number): Duration {
		return new Duration(value);
	}

	private constructor(readonly milliseconds: number) {}

	public inSeconds(): number {
		return this.milliseconds / Duration.millisecondsPerSecond;
	}

	public inMilliseconds(): number {
		return this.milliseconds;
	}
}
