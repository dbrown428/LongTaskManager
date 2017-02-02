import {assert} from "chai";
import {LongTaskClaim} from "../../../src/Domain/LongTaskClaim";

describe("LongTaskClaim", () => {
	it("Should generate a super precise timestamp for this moment.", () => {
		const claimId = LongTaskClaim.withNowTimestamp();
		assert.lengthOf(claimId.value.toString(), 13);
	});
});
