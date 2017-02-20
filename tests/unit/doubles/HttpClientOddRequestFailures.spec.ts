import {assert} from "chai";
import {HttpClientOddRequestFailures} from "../../doubles/HttpClientOddRequestFailures";

describe("HttpClientOddRequestFailures", () => {
	it("should succeed on an even number call count.", async () => {
		const http = new HttpClientOddRequestFailures;
		const response = await http.get("http://test.com/");
		assert.isNotNull(response);
	});

	it("should fail on an odd number call count.", async () => {
		const http = new HttpClientOddRequestFailures;
		await http.get("http://test.com/");

		try {
			await http.get("http://test.com/");
		} catch (error) {
			assert.isNotNull(error);
		}
	});
});
