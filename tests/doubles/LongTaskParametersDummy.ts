import {LongTaskParameters} from "../../src/Domain/LongTaskParameters";

export class LongTaskParametersDummy implements LongTaskParameters {
	public toJSON(): string {
		return this.json;
	}

	public static withJSON(json: string): LongTaskParameters {
		return new LongTaskParametersDummy(json);
	}

	private constructor(readonly json: string) {}
}
