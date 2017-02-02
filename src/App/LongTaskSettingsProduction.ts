import {Duration} from "../Shared/Values/Duration";
import {LongTaskSettings} from "./LongTaskSettings";

export class LongTaskSettingsProduction implements LongTaskSettings {
	cleanupDelay = Duration.withMinutes(60);
	concurrencyMaximum = 5;
	backoffStepTime = Duration.withMilliseconds(50);
	backoffMaximumTime = Duration.withMinutes(6);
	processingTimeMaximum = Duration.withMinutes(10);
}
