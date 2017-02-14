import {LongTaskId} from "./LongTaskId";

export interface LongTaskTracker {
	add(taskId: LongTaskId): void;
	remove(taskId: LongTaskId): void;
	count(): number;
}
