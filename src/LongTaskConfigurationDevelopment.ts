import {LongTaskConfiguration} from "./LongTaskConfiguration";

export class LongTaskConfigurationDevelopment implements LongTaskConfiguration {
	maximumConcurrency: 2;
	cleanupDelayInSeconds: 60;
	maximumProcessingTimeInSeconds: 60;
}
