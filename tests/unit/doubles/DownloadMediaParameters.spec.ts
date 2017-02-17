import {assert} from "chai";
import {DownloadMediaParameters} from "../../doubles/DownloadMediaParameters";

describe("Download media parameters", () => {
	it("should be able to instantiate withItems method.", () => {
		const items = [
			"http://hello.com/1.jpg",
			"http://hello.com/2.jpg",
		];
		const params = DownloadMediaParameters.withItems(items);
		const json = params.toJson();
		assert.equal('{"items":["http://hello.com/1.jpg","http://hello.com/2.jpg"]}', json);
	});

	it("should parse valid DownloadMediaParameters json into items.", () => {
		const json = '{"items":["http://hello.com/1.jpg","http://hello.com/2.jpg"]}';
		const params = DownloadMediaParameters.withJson(json);
		assert.lengthOf(params.items, 2);
	});

	it("should throw an exception when parsing invalid DownloadMediaParameters json.", () => {
		const json = '{"media":24}';
		assert.throws(() => {
			DownloadMediaParameters.withJson(json)
		});
	});
});
