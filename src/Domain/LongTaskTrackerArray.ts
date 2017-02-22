import {LongTaskId} from "./LongTaskId";
import {LongTaskTracker} from "./LongTaskTracker";

export class LongTaskTrackerArray implements LongTaskTracker {
	private processing: Array <LongTaskId>;

	constructor() {
		this.processing = [];
	}

	public add(taskId: LongTaskId) {
		this.processing.push(taskId);
	}

	public remove(taskId: LongTaskId) {
		const index = this.processing.indexOf(taskId);

	    if (index > -1) {
	        this.processing.splice(index, 1);
	    } else {
	    	throw RangeError("The taskId could not be found.");
	    }
	}

	public count(): number {
		return this.processing.length;
	}

	public list(): Array <LongTaskId> {
		return this.processing;
	}
}
