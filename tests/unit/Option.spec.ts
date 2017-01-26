import {assert} from "chai";
import {Option} from "../../src/Option";

describe("Generic Option", () => {
	it("Should be instantiated with some value of a specific type.", () => {
		const option: Option <number> = Option.some(5);
		assert.isTrue(option.isDefined());
		assert.isFalse(option.isEmpty());
		assert.equal(5, option.get());
	});

	it("Should be instantiated with no value.", () => {
		const option: Option <number> = Option.none();
		assert.isFalse(option.isDefined());
		assert.isTrue(option.isEmpty());
		assert.equal(null, option.get());
	});

	it("Should return the supplied alternate value when not defined.", () => {
		const option: Option <string> = Option.none();
		assert.equal("Hello World", option.getOrElse("Hello World"));
	});
});