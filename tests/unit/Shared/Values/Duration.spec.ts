import {assert} from "chai";
import {Duration} from "../../../../src/Shared/Values/Duration";

describe("Duration", () => {
	it("Should instantiate with seconds.", () => {
		const duration = Duration.withSeconds(13);
		assert.equal(duration.inSeconds(), 13);
		assert.equal(duration.inMilliseconds(), 13000);
		assert.equal(duration.inMinutes(), 0.217);
	});

	it("Should instantiate with milliseconds", () => {
		const duration = Duration.withMilliseconds(1300);
		assert.equal(duration.inSeconds(), 1.3);
		assert.equal(duration.inMilliseconds(), 1300);
		assert.equal(duration.inMinutes(), 0.022);
	});

	it("Should instantiate with minutes.", () => {
		const duration = Duration.withMinutes(1.3);
		assert.equal(duration.inSeconds(), 78);
		assert.equal(duration.inMilliseconds(), 78000);
		assert.equal(duration.inMinutes(), 1.3);
	});
});
