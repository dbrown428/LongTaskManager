import {Backoff} from "./Backoff";

export class BackoffSpy implements Backoff {
	resetCallCount: number;
	delayCallCount: number;
	increaseCallCount: number;

	constructor() {
		this.resetCallCount = 0;
		this.delayCallCount = 0;
		this.increaseCallCount = 0;
	}

	public reset(): void {
		this.resetCallCount += 1;
	}

	public delay(): number {
		this.delayCallCount += 1;
		return 0;
	}

	public increase(): void {
		this.increaseCallCount += 1;
	}

	public resetCount(): number {
		return this.resetCallCount;
	}

	public delayCount(): number {
		return this.delayCallCount;
	}

	public increaseCall(): number {
		return this.increaseCallCount;
	}
}
