import {LongTaskId} from "./LongTaskId";
import {LongTaskAttributes} from "./LongTaskAttributes";

export class LongTask {
	constructor(
		readonly identifier: LongTaskId, 
		readonly attributes: LongTaskAttributes
	) {}
}
