import {assert} from "chai";
import {DownloadMediaState} from "../../doubles/DownloadMediaState";

describe("Download Media State", () => {
	it("should show failure reasons in the json output");

	it("should parse empty json value.", () => {
		const state = DownloadMediaState.withJson("");
		const json = state.toJson();
		assert.equal(json, '{"success":[],"failed":[]}');
	});

	it("should parse null json value", () => {
		const state = DownloadMediaState.withJson(null);
		const json = state.toJson();
		assert.equal(json, '{"success":[],"failed":[]}');
	});

	it("should parse valid DownloadMediaState json into attributes.", () => {
		const inputJson = '{"success":["hello","world"],"failed":["nothing"]}';
		const state = DownloadMediaState.withJson(inputJson);
		const json = state.toJson();
		assert.equal(json, inputJson);
	});

	it("should throw an exception when parsing invalid DownloadMediaState json.", () => {
		const inputJson = '{"hello":"world"}';
		assert.throws(() => {
			DownloadMediaState.withJson(inputJson);
		});
	});

	it("should append items to the success and failed arrays.", () => {
		const inputJson = '{"success":["sweet"],"failed":[]}';
		const state = DownloadMediaState.withJson(inputJson);
		state.addToSuccess("hello");
		state.addToSuccess("world");
		state.addToFailed("lame", "Could not process");
		const json = state.toJson();
		assert.equal(json, '{"success":["sweet","hello","world"],"failed":["lame"]}');
	});

	it("should count the failed and success items.", () => {
		const inputJson = '{"success":["hello","world"],"failed":["nothing"]}';
		const state = DownloadMediaState.withJson(inputJson);
		assert.equal(state.count(), 3);
	});

	it("should diff an empty array against another empty array and result in an empty array.", () => {
		const state = DownloadMediaState.withJson(null);
		const result = state.diff([]);
		assert.lengthOf(result, 0);
	});

	it("should diff an empty array against a full array and result in an empty array.", () => {
		const inputJson = '{"success":["hello","world"],"failed":["nothing"]}';
		const state = DownloadMediaState.withJson(inputJson);
		const result = state.diff([]);
		assert.lengthOf(result, 0);
	});

	it("should diff a full array against an empty array and result in full array.", () => {
		const state = DownloadMediaState.withJson(null);
		const result = state.diff(["hello", "world", "nothing"]);
		assert.lengthOf(result, 3);
	});

	it("should diff the same arrays and result in an empty array.", () => {
		const inputJson = '{"success":["hello","world"],"failed":["nothing"]}';
		const state = DownloadMediaState.withJson(inputJson);
		const result = state.diff(["hello", "world", "nothing"]);
		assert.lengthOf(result, 0);
	});

	it("should diff mixed arrays", () => {
		const inputJson = '{"success":["world"],"failed":["nothing"]}';
		const state = DownloadMediaState.withJson(inputJson);
		const result = state.diff(["great", "nothing", "happy", "world", "hello"]);		
		assert.lengthOf(result, 3);
		assert.equal(result[0], "great");
		assert.equal(result[1], "happy");
		assert.equal(result[2], "hello");
	});
});
