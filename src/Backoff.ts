
export interface Backoff {
	reset(): void;
	delay(): number;
	increase(): void;
}
