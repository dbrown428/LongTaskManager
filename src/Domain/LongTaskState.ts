export interface LongTaskState {
	// Implment me.
	// static withJson(json: string | null): LongTaskState;

	/**
	 * A JSON string of all the private values needed.
	 * @return json
	 */
	toJson(): string;
	
	/**
	 * Add an item to the success state.
	 * @param item 
	 */
	// addToSuccess(item: string): void;	// should this be here? 
	// ^^^^ not sure how I feel about this.

	/**
	 * Add an item to the failed state.
	 * @param item	
	 */
	// addToFailed(item: string, reason: string): void;
	// ^^^^ not sure how I feel about this.

	/**
	 * The total number of successful and failed items processed.
	 * 
	 * @return count
	 */
	processedCount(): number;
}
