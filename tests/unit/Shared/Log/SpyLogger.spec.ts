import {assert} from "chai";
import {SpyLogger} from "../../../../src/Shared/Log/SpyLogger";

describe("Spy Logger", () => {
	it("Should count info calls.", () => {
		const logger = new SpyLogger;
		logger.info("Designates informational messages that highlight the progress of the application at coarse-grained level.");
		assert.equal(logger.infoCount(), 1);
	});

	it("Should count debug calls.", () => {
		const logger = new SpyLogger;
		logger.debug("Designates fine-grained informational events that are most useful to debug an application.");
		logger.debug("Designates fine-grained informational events that are most useful to debug an application.");
		assert.equal(logger.debugCount(), 2);
	});

	it("Should count trace calls.", () => {
		const logger = new SpyLogger;
		logger.trace("Designates finer-grained informational events than the DEBUG.");
		logger.trace("Designates finer-grained informational events than the DEBUG.");
		logger.trace("Designates finer-grained informational events than the DEBUG.");
		assert.equal(logger.traceCount(), 3);
	});

	it("Should count error calls.", () => {
		const logger = new SpyLogger;
		logger.error("Designates error events that might still allow the application to continue running.");
		assert.equal(logger.errorCount(), 1);
	});

	it("Should count fatal calls.", () => {
		const logger = new SpyLogger;
		logger.fatal("Designates very severe error events that will presumably lead the application to abort.");
		logger.fatal("Designates very severe error events that will presumably lead the application to abort.");
		assert.equal(logger.fatalCount(), 2);
	});

	it("Should count warn calls.", () => {
		const logger = new SpyLogger;
		logger.warn("Designates potentially harmful situations.");
		logger.warn("Designates potentially harmful situations.");
		logger.warn("Designates potentially harmful situations.");
		assert.equal(logger.warnCount(), 3);
	});
});
