import {Backoff} from "./Backoff";

export class BackoffDummy implements Backoff {
	public delay(): number {
		return 0;
	}

	public reset() {}
	public increase() {}
}
