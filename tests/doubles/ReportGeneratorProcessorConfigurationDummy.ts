import {ReportGeneratorDummy} from "./ReportGeneratorDummy";
import {LongTaskType} from "../../src/Domain/LongTaskType";
import {LongTaskProcessor} from "../../src/Domain/LongTaskProcessor";
import {LongTaskProcessorConfiguration} from "../../src/Domain/LongTaskProcessorConfiguration";

export class ReportGeneratorProcessorConfigurationDummy implements LongTaskProcessorConfiguration {
	public key(): LongTaskType {
		return LongTaskType.withValue("ReportGeneratorDummy");
	}

	public default(): LongTaskProcessor {
		return new ReportGeneratorDummy;
	}
}
