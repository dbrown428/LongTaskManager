export interface LongTaskState {
	// Implment me.
	// static withJson(json: string | null): LongTaskState;

	/**
	 * A JSON string of all the private values needed.
	 * @return json
	 */
	toJson(): string;
	
	/**
	 * The total number of successful and failed items processed.
	 * 
	 * @return count
	 */
	processedCount(): number;
}
