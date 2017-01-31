import {LongTaskConfiguration} from "./LongTaskConfiguration";

export class LongTaskConfigurationDevelopment implements LongTaskConfiguration {
	cleanupDelay: 60000;
	maximumConcurrency: 2;
}
