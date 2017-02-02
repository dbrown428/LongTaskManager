import {assert} from "chai";
import {BaseTwoExponentialBackoff} from "../../src/Backoff/BaseTwoExponentialBackoff";

describe("Exponential backoff", () => {
	describe("When initializing", () => {
		it("Should throw an exception for an invalid base value.", () => {
			assert.throws(() => {
				BaseTwoExponentialBackoff.withMultiplierAndMaximum(0, 6400);
			}, RangeError);
		});

		it("Should throw an exception for a maximum value that is equal-to or smaller-than the base value.", () => {
			assert.throws(() => {
				BaseTwoExponentialBackoff.withMultiplierAndMaximum(100, 100);
			}, RangeError);
		});

		it("Should accept a maximum value of zero to represent no limit.", () => {
			const backoff = BaseTwoExponentialBackoff.withMultiplier(100);
			backoff.increase();
			assert.equal(backoff.delay(), 100);
		});

		it("Should have an initial delay value of zero.", () => {
	 		const backoff = BaseTwoExponentialBackoff.withMultiplierAndMaximum(100, 6400);
	 		assert.equal(backoff.delay(), 0);
		});
	});

	describe("When modifying the delay", () => {
		it("Should increase the delay by the step value when the initial delay is zero.", () => {
			const backoff = BaseTwoExponentialBackoff.withMultiplierAndMaximum(100, 6400);
			backoff.increase();
			assert.equal(backoff.delay(), 100);
		});

		it("Should increase the delay exponentially.", () => {
			const backoff = BaseTwoExponentialBackoff.withMultiplierAndMaximum(100, 6400);
			backoff.increase();
			backoff.increase();
			backoff.increase();
			assert.equal(backoff.delay(), 400);
		});

		it("Should limit the delay to the maximum value if it is set.", () => {
			const backoff = BaseTwoExponentialBackoff.withMultiplierAndMaximum(100, 200);
			backoff.increase();
			backoff.increase();
			backoff.increase();
			assert.equal(backoff.delay(), 200);
		});

		it("Should be able to reset the delay to its initial value.", () => {
			const backoff = BaseTwoExponentialBackoff.withMultiplierAndMaximum(100, 6400);
			backoff.increase();
			backoff.reset();
			assert.equal(backoff.delay(), 0);
		});
	});
});
