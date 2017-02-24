import {Duration} from "../Shared/Values/Duration";
import {LongTaskSettings} from "../Domain/LongTaskSettings";

export class LongTaskSettingsDevelopment implements LongTaskSettings {
	cleanupDelay = Duration.withSeconds(20);
	concurrencyMaximum = 2;
	backoffStepTime = Duration.withMilliseconds(100);
	backoffMaximumTime = Duration.withSeconds(30);

	// tickTimeMaximum = Duration.withMilliseconds(300);
	processingTimeMaximum = Duration.withMilliseconds(300);
}
