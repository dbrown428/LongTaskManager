export class Duration {
	static readonly secondsPerMinute = 60;
	static readonly millisecondsPerSecond = 1000;

	public static withSeconds(value: number): Duration {
		const milliseconds = value * Duration.millisecondsPerSecond;
		return new Duration(milliseconds);
	}

	private constructor(readonly milliseconds: number) {}

	public static withMilliseconds(value: number): Duration {
		return new Duration(value);
	}

	public static withMinutes(value: number): Duration {
		const milliseconds = value * Duration.secondsPerMinute * Duration.millisecondsPerSecond;
		return new Duration(milliseconds);
	}

	public inSeconds(): number {
		const seconds = this.milliseconds / Duration.millisecondsPerSecond;
		return seconds;
	}

	public inMilliseconds(): number {
		return this.milliseconds;
	}

	public inMinutes():  number {
		const minutes = this.milliseconds / Duration.millisecondsPerSecond / Duration.secondsPerMinute;
		const fixed = this.round(minutes, 3);

		return fixed;
	}

	private round(value: number, decimals: number): number {
		return parseFloat(value.toFixed(decimals));
	}
}
