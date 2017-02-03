import {assert} from "chai";
import {LongTaskClaim} from "../../../src/Domain/LongTaskClaim";

describe("LongTaskClaim", () => {
	it("Should generate a super precise timestamp for this moment.", () => {
		const claim = LongTaskClaim.withNowTimestamp();
		assert.lengthOf(claim.value.toString(), 13);
	});

	it("Should accept only timestamp numbers", () => {
		assert.throws(() => {
			LongTaskClaim.withExistingTimestamp(123);
		}, RangeError);
	});

	it("Should accept an arbitrary existing timestamp", () => {
		const value = 1234567891011;
		const claim = LongTaskClaim.withExistingTimestamp(value);
		assert.equal(claim.value, value);
	});
});
