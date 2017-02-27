import {LongTaskParameters} from "../../src/Domain/LongTaskParameters";

export class DownloadMediaLongTaskParameters implements LongTaskParameters {
	public static withItems(items: Array <string>): DownloadMediaLongTaskParameters {
		return new DownloadMediaLongTaskParameters(items);
	}

	private constructor(readonly items: Array <string>) {}

	public static withJson(json: string): DownloadMediaLongTaskParameters {
		const params = JSON.parse(json);

		if (params.hasOwnProperty("items")) {
			return new DownloadMediaLongTaskParameters(params.items);
		} else {
			throw Error("The following JSON is invalid for the DownloadMediaLongTaskParameters. It is missing the 'items' property. Make sure you create parameters using implementations of LongTaskParameters:" + json);
		}
	}

	public toJson(): string {
		const serializedItems = JSON.stringify(this.items);
		const json = '{"items":' + serializedItems + '}';
		return json;
	}
}
