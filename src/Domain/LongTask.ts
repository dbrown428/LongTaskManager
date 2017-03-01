import {LongTaskInfo} from "./LongTaskInfo";
import {LongTaskProgress} from "./LongTaskProgress";

export interface LongTask {
	
	
	/**
	 * 
	 */
	tick(task: LongTaskInfo): Promise <LongTaskProgress>
}
