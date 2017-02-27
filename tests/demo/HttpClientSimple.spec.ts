import {assert} from "chai";
import {HttpClientSimple} from "../../demo/FGSystem/HttpClient/HttpClientSimple";

describe("Http client simple", () => {
	it("should get data at url", async () => {
		const client = new HttpClientSimple;
		const data = await client.get("http://stackoverflow.com/");
		assert.isNotNull(data);
	});

	it("should also throw failures", async () => {
		const client = new HttpClientSimple;

		try {
			await client.get("http://freshgrade.com/");
		} catch (error) {
			assert.isNotNull(error);
		}
	});
});
