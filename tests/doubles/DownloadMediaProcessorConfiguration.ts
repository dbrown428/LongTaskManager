import {HttpClientSpy} from "./HttpClientSpy";
import {LongTaskType} from "../../src/Domain/LongTaskType";
import {DownloadMediaProcessor} from "./DownloadMediaProcessor";
import {LongTaskProcessor} from "../../src/Domain/LongTaskProcessor";
import {LongTaskProcessorConfiguration} from "../../src/Domain/LongTaskProcessorConfiguration";

export class DownloadMediaProcessorConfiguration implements LongTaskProcessorConfiguration {
	public key(): LongTaskType {
		return new LongTaskType("DownloadMedia");
	}

	public default(): LongTaskProcessor {
		const httpClient = new HttpClientSpy;
		return new DownloadMediaProcessor(httpClient);
	}
}
