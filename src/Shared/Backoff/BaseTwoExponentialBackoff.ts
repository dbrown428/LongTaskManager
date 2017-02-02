import {Backoff} from "./Backoff";
import {Duration} from "../Values/Duration";

export class BaseTwoExponentialBackoff implements Backoff {
	private exponent: number;

	public static withMultiplierAndMaximum(base: Duration, maximum: Duration): Backoff {
		return new BaseTwoExponentialBackoff(base.inMilliseconds(), maximum.inMilliseconds());
	}

	private constructor(private multiplier: number, private maximum: number) {
		this.exponent = 0;
		this.validate(multiplier, maximum);
	}

	private validate(multiplier: number, maximum: number) {
		if (this.multiplier <= 0) {
			throw new RangeError("The base value must be greater-than zero.");
		} else if (this.maximum <= this.multiplier && this.maximum != 0) {
			throw new RangeError("The maximum value must be greater than the base value.");
		}
	}

	public static withMultiplier(base: Duration): Backoff {
		return new BaseTwoExponentialBackoff(base.inMilliseconds(), 0);
	}

	public delay(): number {
		const value = this.calculateDelay();

		if (value >= this.maximum && this.maximum != 0) {
			return this.maximum;
		} else {
			return value;
		}
	}

	private calculateDelay(): number {
		if (this.exponent == 0) {
			return 0;
		} else {
			const i = this.exponent - 1;
			return Math.pow(2, i) * 100;
		}
	}

	public reset(): void {
		this.exponent = 0;
	}

	public increase(): void {
		this.exponent += 1;
	}
}
