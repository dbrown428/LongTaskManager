import {assert} from "chai";
import {DownloadMediaLongTaskParameters} from "../../demo/DownloadMedia/DownloadMediaLongTaskParameters";

describe("Download media long task parameters", () => {
	it("should be able to instantiate withItems method.", () => {
		const items = [
			"http://hello.com/1.jpg",
			"http://hello.com/2.jpg",
		];
		const params = DownloadMediaLongTaskParameters.withItems(items);
		const json = params.toJson();
		assert.equal('{"items":["http://hello.com/1.jpg","http://hello.com/2.jpg"]}', json);
	});

	it("should parse valid DownloadMediaLongTaskParameters json into items.", () => {
		const json = '{"items":["http://hello.com/1.jpg","http://hello.com/2.jpg"]}';
		const params = DownloadMediaLongTaskParameters.withJson(json);
		assert.lengthOf(params.items, 2);
	});

	it("should throw an exception when parsing invalid DownloadMediaLongTaskParameters json.", () => {
		const json = '{"media":24}';
		assert.throws(() => {
			DownloadMediaLongTaskParameters.withJson(json)
		});
	});
});
