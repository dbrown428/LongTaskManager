import {LongTaskParameters} from "../../src/Domain/LongTaskParameters";

export class DownloadMediaParameters implements LongTaskParameters {
	public static withItems(items: Array <string>): DownloadMediaParameters {
		return new DownloadMediaParameters(items);
	}

	private constructor(readonly items: Array <string>) {}

	public static withJson(json: string): DownloadMediaParameters {
		const params = JSON.parse(json);

		if (params.hasOwnProperty("items")) {
			return new DownloadMediaParameters(params.items);
		} else {
			throw Error("The following JSON is invalid for the DownloadMediaParameters. It is missing the 'items' property. Make sure you create parameters using implementations of LongTaskParameters:" + json);
		}
	}

	public toJson(): string {
		const serializedItems = JSON.stringify(this.items);
		const json = '{"items":' + serializedItems + '}';
		return json;
	}
}
