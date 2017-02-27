import {assert} from "chai";
import {DownloadMediaLongTaskState} from "../../demo/DownloadMedia/DownloadMediaLongTaskState";

describe("Download media long task state", () => {
	it("should show failure reasons in the json output");

	it("should parse empty json value.", () => {
		const state = DownloadMediaLongTaskState.withJson("");
		const json = state.toJson();
		assert.equal(json, '{"success":[],"failed":[]}');
	});

	it("should parse null json value", () => {
		const state = DownloadMediaLongTaskState.withJson(null);
		const json = state.toJson();
		assert.equal(json, '{"success":[],"failed":[]}');
	});

	it("should parse valid DownloadMediaLongTaskState json into attributes.", () => {
		const inputJson = '{"success":["hello","world"],"failed":["nothing"]}';
		const state = DownloadMediaLongTaskState.withJson(inputJson);
		const json = state.toJson();
		assert.equal(json, inputJson);
	});

	it("should throw an exception when parsing invalid DownloadMediaLongTaskState json.", () => {
		const inputJson = '{"hello":"world"}';
		assert.throws(() => {
			DownloadMediaLongTaskState.withJson(inputJson);
		});
	});

	it("should append items to the success and failed arrays.", () => {
		const inputJson = '{"success":["sweet"],"failed":[]}';
		const state = DownloadMediaLongTaskState.withJson(inputJson);
		state.addToSuccess("hello");
		state.addToSuccess("world");
		state.addToFailed("lame", "Could not process");
		const json = state.toJson();
		assert.equal(json, '{"success":["sweet","hello","world"],"failed":["lame"]}');
	});

	it("should count the failed and success items.", () => {
		const inputJson = '{"success":["hello","world"],"failed":["nothing"]}';
		const state = DownloadMediaLongTaskState.withJson(inputJson);
		assert.equal(state.processedCount(), 3);
	});
});
