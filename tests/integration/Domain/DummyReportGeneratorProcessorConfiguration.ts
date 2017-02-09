import {DummyReportGenerator} from "./DummyReportGenerator";
import {LongTaskType} from "../../../src/Domain/LongTaskType";
import {LongTaskProcessor} from "../../../src/Domain/LongTaskProcessor";
import {LongTaskProcessorConfiguration} from "../../../src/Domain/LongTaskProcessorConfiguration";

export class DummyReportGeneratorProcessorConfiguration implements LongTaskProcessorConfiguration {
	public key(): LongTaskType {
		return {type: "DummyReportGenerator"};
	}

	public default(): LongTaskProcessor {
		return new DummyReportGenerator;
	}
}
