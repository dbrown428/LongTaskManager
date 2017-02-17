import {HttpClient} from "./HttpClient";

export class HttpClientSpy implements HttpClient {
	private getCallCount: number;

	constructor() {
		this.getCallCount = 0;
	}

	public async get(url: string): Promise <string> {
		this.getCallCount += 1;
		return Promise.resolve("hello world");
	}

	public getCount(): number {
		return this.getCallCount;
	}
}
