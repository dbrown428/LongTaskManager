import {LongTaskParameters} from "../../src/Domain/LongTaskParameters";

export class LongTaskParametersDummy implements LongTaskParameters {
	public toJson(): string {
		return this.json;
	}

	public static withJson(json: string): LongTaskParameters {
		return new LongTaskParametersDummy(json);
	}

	private constructor(readonly json: string) {}
}
