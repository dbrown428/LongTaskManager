import {Duration} from "../../src/Shared/Values/Duration";

export class Delayable {
	static async delay(duration: Duration): Promise <void> {
		return new Promise <void> ((resolve, reject) => {
			setTimeout(() => {
				resolve();
			}, duration.inMilliseconds());
		});
	}
}
