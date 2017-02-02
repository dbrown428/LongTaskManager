import {assert} from "chai";
import {Duration} from "../../src/Duration";

describe("Duration", () => {
	it("Should instantiate with seconds.", () => {
		const duration = Duration.withSeconds(13);
		assert.equal(duration.inSeconds(), 13);
		assert.equal(duration.inMilliseconds(), 13000);
	});

	it("Should instantiate with milliseconds", () => {
		const duration = Duration.withMilliseconds(1300);
		assert.equal(duration.inSeconds(), 1.3);
		assert.equal(duration.inMilliseconds(), 1300);
	});
});
