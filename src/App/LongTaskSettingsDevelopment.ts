import {Duration} from "../Shared/Values/Duration";
import {LongTaskSettings} from "./LongTaskSettings";

export class LongTaskSettingsDevelopment implements LongTaskSettings {
	cleanupDelay = Duration.withSeconds(20);
	concurrencyMaximum = 2;
	backoffStepTime = Duration.withMilliseconds(100);
	backoffMaximumTime = Duration.withSeconds(30);
	processingTimeMaximum = Duration.withSeconds(5);
}
