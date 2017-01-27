import {LongTaskConfiguration} from "./LongTaskConfiguration";

export class LongTaskConfigurationStub implements LongTaskConfiguration {
	cleanupDelay: 60000;
	maximumConcurrency: 2;
}
