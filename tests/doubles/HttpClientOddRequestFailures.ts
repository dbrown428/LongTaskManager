import {HttpClient} from "./HttpClient";

export class HttpClientOddRequestFailures implements HttpClient {
	private getCallCount: number;

	constructor() {
		this.getCallCount = 0;
	}

	public async get(url: string): Promise <string> {
		return new Promise <string> ((resolve, reject) => {
			this.getCallCount += 1;

			if (this.getCallCount % 2) {
				resolve('{"key":[1,2,3,4,5]');
			} else {
				reject("Failed to get data.");
			}
		});
	}
}
