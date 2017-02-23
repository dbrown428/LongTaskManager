import {LongTaskParameters} from "../../src/Domain/LongTaskParameters";

export class LongTaskParametersDummy implements LongTaskParameters {
	public toJson(): string {
		return '{"hello":"world"}';
	}
}
