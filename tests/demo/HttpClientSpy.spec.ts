import {assert} from "chai";
import {HttpClientSpy} from "../../demo/FGSystem/HttpClient/HttpClientSpy";

describe("Http Client Spy", () => {
	it("should initially have a zero get count", () => {
		const spy = new HttpClientSpy;
		assert.equal(spy.getCount(), 0);
	});

	it("should track get count", async () => {
		const spy = new HttpClientSpy;
		await spy.get("http://test1.com");
		await spy.get("http://test2.com");
		assert.equal(spy.getCount(), 2);
	});
});
