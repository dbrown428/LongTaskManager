import {Duration} from "./Duration";

export interface LongTaskConfiguration {
	cleanupDelay: Duration;
	maximumConcurrency: number;
	maximumProcessingTime: Duration;
}
