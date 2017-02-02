import {assert} from "chai";
import {ClaimId} from "../../src/ClaimId";

describe("ClaimId", () => {
	it("Should generate a super precise timestamp for this moment.", () => {
		const claimId = ClaimId.withNowTimestamp();
		assert.lengthOf(claimId.value.toString(), 13);
	});
});
