import {HttpClientSpy} from "./HttpClientSpy";
import {LongTaskType} from "../../src/Domain/LongTaskType";
import {ImageManipulatorDummy} from "./ImageManipulatorDummy";
import {DownloadMediaLongTask} from "./DownloadMediaLongTask";
import {LoggerConsole} from "../../src/Shared/Log/LoggerConsole";
import {LongTask} from "../../src/Domain/LongTask";
import {LongTaskConfiguration} from "../../src/Domain/LongTaskConfiguration";

// Single or multiple instances? REVIEW... 
// TODO
export class DownloadMediaLongTaskConfiguration implements LongTaskConfiguration {
	public key(): LongTaskType {
		return LongTaskType.withValue("download-media-cool");
	}

	// Those should be called by the registry to create "many" processors at once.
	public default(): LongTask {
		const logger = new LoggerConsole;
		const httpClient = new HttpClientSpy;	// review
		const manipulator = new ImageManipulatorDummy;
		return new DownloadMediaLongTask(logger, httpClient, manipulator);
	}
}
