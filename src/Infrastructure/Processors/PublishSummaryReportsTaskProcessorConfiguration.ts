import {LongTaskType} from "../../Domain/LongTaskType";
import {LongTaskProcessor} from "../../Domain/LongTaskProcessor";
import {PublishSummaryReportsTaskProcessor} from "./PublishSummaryReportsTaskProcessor";
import {LongTaskProcessorConfiguration} from "../../Domain/LongTaskProcessorConfiguration";

export class PublishSummaryReportsTaskProcessorConfiguration implements LongTaskProcessorConfiguration {
	public key(): LongTaskType {
		return {type: "PublishSummaryReportsForStudents"};
	}

	public default(): LongTaskProcessor {
		// Configure dependencies here for the task processor, eg:
		// - reports repository on main system
		// - students repository on main system
		// - file storage
		return new PublishSummaryReportsTaskProcessor;
	}
}
