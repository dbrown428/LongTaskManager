import {Duration} from "../Shared/Values/Duration";
import {LongTaskSettings} from "../Domain/LongTaskSettings";

export class LongTaskSettingsTesting implements LongTaskSettings {

	// constructor(concurrency)

	cleanupThreshold = Duration.withMinutes(10);
	concurrencyMaximum = 2;
	backoffStepTime = Duration.withMilliseconds(100);
	backoffMaximumTime = Duration.withSeconds(30);

	// tickTimeMaximum = Duration.withMilliseconds(300);
	processingTimeMaximum = Duration.withMilliseconds(300);
}
