import {DownloadMediaProcessor} from "./DownloadMediaProcessor";
import {LongTaskType} from "../../src/Domain/LongTaskType";
import {LongTaskProcessor} from "../../src/Domain/LongTaskProcessor";
import {LongTaskProcessorConfiguration} from "../../src/Domain/LongTaskProcessorConfiguration";

export class DownloadMediaProcessorConfiguration implements LongTaskProcessorConfiguration {
	public key(): LongTaskType {
		return new LongTaskType("DownloadMedia");
	}

	public default(): LongTaskProcessor {
		return new DownloadMediaProcessor;
	}
}
