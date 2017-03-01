import {Duration} from "../Shared/Values/Duration";

export interface LongTaskSettings {
	cleanupThreshold: Duration;
	concurrencyMaximum: number;
	backoffStepTime: Duration;
	backoffMaximumTime: Duration;
	processingTimeMaximum: Duration;
}
