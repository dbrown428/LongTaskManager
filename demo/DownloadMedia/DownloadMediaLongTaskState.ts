import {LongTaskState} from "../../src/Domain/LongTaskState";

interface Dictionary <T> {
	[K: string]: T;
}

export class DownloadMediaLongTaskState implements LongTaskState {
	private success: Array <string>;
	private failed: Array <string>;
	// failure reasons. or should that be in the same array.
	// {failed:[{"url":"http...", "reason": "Bad stuff happened."}]}

	public toJson(): string {
		const data: Dictionary <Array <string>> = {};
		data["success"] = this.success;
		data["failed"] = this.failed;
		return JSON.stringify(data);
	}

	public addToSuccess(item: string): void {
		this.success.push(item);
	}
	
	public addToFailed(item: string, reason: string): void {
		// failureReasons - TODO
		this.failed.push(item);
	}

	// perhaps remove this... should determine next index, based on
	// what has been processed already. Assuming the count is the next index is
	// incorrect.
	public processedCount(): number {
		return this.success.length + this.failed.length;
	}

	public static withJson(json: string | null): DownloadMediaLongTaskState {
		if ( ! json || json.length == 0) {
			return new DownloadMediaLongTaskState([], []);
		}

		const params = JSON.parse(json);

		if (params.hasOwnProperty("success") && params.hasOwnProperty("failed")) {
			return new DownloadMediaLongTaskState(params.success, params.failed); 	
		} else {
			throw Error("The following JSON is invalid for the DownloadMediaLongTaskState. It is missing the 'success' and/or the 'failed' attributes: " + json);
		}
	}

	private constructor(success: Array <string>, failed: Array <string>) {
		this.success = success;
		this.failed = failed;
	}
}
