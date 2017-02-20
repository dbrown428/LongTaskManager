import {HttpClientSpy} from "./HttpClientSpy";
import {LongTaskType} from "../../src/Domain/LongTaskType";
import {ImageManipulatorDummy} from "./ImageManipulatorDummy";
import {DownloadMediaProcessor} from "./DownloadMediaProcessor";
import {LongTaskProcessor} from "../../src/Domain/LongTaskProcessor";
import {LongTaskProcessorConfiguration} from "../../src/Domain/LongTaskProcessorConfiguration";

export class DownloadMediaProcessorConfiguration implements LongTaskProcessorConfiguration {
	public key(): LongTaskType {
		return new LongTaskType("DownloadMedia");
	}

	public default(): LongTaskProcessor {
		const httpClient = new HttpClientSpy;
		const manipulator = new ImageManipulatorDummy;
		return new DownloadMediaProcessor(httpClient, manipulator);
	}
}
