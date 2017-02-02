import {Duration} from "../Shared/Values/Duration";

export interface LongTaskSettings {
	cleanupDelay: Duration;
	concurrencyMaximum: number;
	backoffStepTime: Duration;
	backoffMaximumTime: Duration;
	processingTimeMaximum: Duration;
}
