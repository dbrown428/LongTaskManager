import {assert} from "chai";
import {Duration} from "../../../src/Shared/Values/Duration";
import {DelayedResultsProcessorConfiguration} from "../../doubles/DelayedResultsProcessorConfiguration";

describe("DelayedResultsProcessorConfiguration", () => {
	it("should instantiate with no duration specified", () => {
		const config = new DelayedResultsProcessorConfiguration();
		assert.equal(config.duration.inMilliseconds(), 100);
	});

	it("should instantiate with a specified duration", () => {
		const duration = Duration.withMilliseconds(20);
		const config = new DelayedResultsProcessorConfiguration(duration);
		assert.equal(config.duration.inMilliseconds(), 20);
	});
});
