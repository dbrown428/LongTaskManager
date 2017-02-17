import * as Client from "http";
import {HttpClient} from "./HttpClient";

export class HttpClientSimple implements HttpClient {
	public async get(url: string): Promise <string> {
		return new Promise <string> ((resolve, reject) => {
			Client.get(url, function(response) {
				if (response.statusCode == 200) {
					const fakeData = '{"key":[1,2,3,4,5]}';
					resolve(fakeData);
				} else {
					const reason = "Failed to get data. Response code: " + response.statusCode;
					reject(reason);
				}
		    });
		});
	}
}
