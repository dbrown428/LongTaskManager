import {Duration} from "../../src/Shared/Values/Duration";

export class Delay {
	static async for(duration: Duration): Promise <void> {
		return new Promise <void> ((resolve, reject) => {
			setTimeout(() => {
				resolve();
			}, duration.inMilliseconds());
		});
	}
}
