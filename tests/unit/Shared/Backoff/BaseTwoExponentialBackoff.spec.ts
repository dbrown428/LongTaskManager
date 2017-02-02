import {assert} from "chai";
import {Duration} from "../../../../src/Shared/Values/Duration";
import {BaseTwoExponentialBackoff} from "../../../../src/Shared/Backoff/BaseTwoExponentialBackoff";

describe("Exponential backoff", () => {
	describe("When initializing", () => {
		it("Should throw an exception for an invalid base value.", () => {
			assert.throws(() => {
				const base = Duration.withMilliseconds(0);
				const max = Duration.withMilliseconds(6400);
				BaseTwoExponentialBackoff.withMultiplierAndMaximum(base, max);
			}, RangeError);
		});

		it("Should throw an exception for a maximum value that is equal-to or smaller-than the base value.", () => {
			assert.throws(() => {
				const base = Duration.withMilliseconds(100);
				const max = Duration.withMilliseconds(100);
				BaseTwoExponentialBackoff.withMultiplierAndMaximum(base, max);
			}, RangeError);
		});

		it("Should accept a maximum value of zero to represent no limit.", () => {
			const base = Duration.withMilliseconds(100);
			const backoff = BaseTwoExponentialBackoff.withMultiplier(base);
			backoff.increase();
			backoff.increase();
			assert.equal(backoff.delay(), 200);
		});

		it("Should have an initial delay value of zero.", () => {
			const base = Duration.withMilliseconds(100);
			const max = Duration.withMilliseconds(6400);
	 		const backoff = BaseTwoExponentialBackoff.withMultiplierAndMaximum(base, max);
	 		assert.equal(backoff.delay(), 0);
		});
	});

	describe("When modifying the delay", () => {
		it("Should increase the delay by the step value when the initial delay is zero.", () => {
			const base = Duration.withMilliseconds(100);
			const max = Duration.withMilliseconds(6400);
	 		const backoff = BaseTwoExponentialBackoff.withMultiplierAndMaximum(base, max);
			backoff.increase();
			assert.equal(backoff.delay(), 100);
		});

		it("Should increase the delay exponentially.", () => {
			const base = Duration.withMilliseconds(100);
			const max = Duration.withMilliseconds(6400);
	 		const backoff = BaseTwoExponentialBackoff.withMultiplierAndMaximum(base, max);
			backoff.increase();
			backoff.increase();
			backoff.increase();
			assert.equal(backoff.delay(), 400);
		});

		it("Should limit the delay to the maximum value if it is set.", () => {
			const base = Duration.withMilliseconds(100);
			const max = Duration.withMilliseconds(200);
	 		const backoff = BaseTwoExponentialBackoff.withMultiplierAndMaximum(base, max);
			backoff.increase();
			backoff.increase();
			backoff.increase();
			assert.equal(backoff.delay(), 200);
		});

		it("Should be able to reset the delay to its initial value.", () => {
			const base = Duration.withMilliseconds(100);
			const max = Duration.withMilliseconds(6400);
	 		const backoff = BaseTwoExponentialBackoff.withMultiplierAndMaximum(base, max);
			backoff.increase();
			backoff.reset();
			assert.equal(backoff.delay(), 0);
		});
	});
});
