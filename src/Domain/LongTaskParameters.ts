export interface LongTaskParameters {
	/**
	 * Prepare a JSON string of all the private values needed.
	 * 
	 * @return valid json
	 */
	toJSON(): string;

	/**
	 * Parses the JSON string and sets the appropriate internal values.
	 * I'm not sure how to make this a static method and make it required.
	 * 
	 * @param  json             	Expecting JSON that was created by using the 'toJSON' implementation above, and not some random JSON string.
	 * @return LongTaskParameters
	 *
	 * @throws SyntaxError if invalid JSON syntax
	 * @throws Error if invalid LongTaskParameters json; each implementation has it's own attributes.
	 */
	//static withJSON(json: string): LongTaskParameters;
}
