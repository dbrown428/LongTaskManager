import {HttpClientSpy} from "./HttpClientSpy";
import {LongTaskType} from "../../src/Domain/LongTaskType";
import {ImageManipulatorDummy} from "./ImageManipulatorDummy";
import {DownloadMediaProcessor} from "./DownloadMediaProcessor";
import {LoggerConsole} from "../../src/Shared/Log/LoggerConsole";
import {LongTaskProcessor} from "../../src/Domain/LongTaskProcessor";
import {LongTaskProcessorConfiguration} from "../../src/Domain/LongTaskProcessorConfiguration";

export class DownloadMediaProcessorConfiguration implements LongTaskProcessorConfiguration {
	public key(): LongTaskType {
		return LongTaskType.withValue("DownloadMedia");
	}

	public default(): LongTaskProcessor {
		const logger = new LoggerConsole;
		const httpClient = new HttpClientSpy;	// review
		const manipulator = new ImageManipulatorDummy;
		return new DownloadMediaProcessor(logger, httpClient, manipulator);
	}
}
