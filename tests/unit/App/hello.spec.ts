import {assert} from "chai";
import {Promise} from 'es6-promise';

class Hello {
	doSomething(): Promise <boolean> {
		return new Promise((resolve, reject) => {
			reject("Bad things");
		});
	}
}

describe("Testing promises", () => {
	it("Resolve vs reject", () => {
		const t = new Hello;

		return t.doSomething()
			.then((confirmed: boolean) => {
				assert.isFalse(confirmed);
			})
			.catch((error) => {
				assert.isNull(error);
			});
	});
});
