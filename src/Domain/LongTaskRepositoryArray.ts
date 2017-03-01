import {Promise} from 'es6-promise';
import {LongTaskInfo} from "../../Domain/LongTaskInfo";
import {UserId} from "../../Shared/Values/UserId";
import {LongTaskId} from "../../Domain/LongTaskId";
import {Duration} from "../../Shared/Values/Duration";
import {LongTaskType} from "../../Domain/LongTaskType";
import {LongTaskClaim} from "../../Domain/LongTaskClaim";
import {LongTaskProgress} from "../../Domain/LongTaskProgress";
import {LongTaskRepository} from "../../Domain/LongTaskRepository";
import {LongTaskParameters} from "../../Domain/LongTaskParameters";
import {LongTaskAttributes, LongTaskStatus} from "../../Domain/LongTaskAttributes";
import {LongTaskStatusChangeValidator} from "../../Domain/LongTaskStatusChangeValidator";

// Used to represent an entry in the array table.
class DataRow {
	constructor(
	readonly identifier: string, 
		readonly ownerId: string,
		readonly searchKey: Array <string>,
		readonly type: string, 
		readonly params: string, 
		readonly status: number, 
		readonly progressState: string | null, 
		readonly progressCurrentStep: number | null, 
		readonly progressMaximumSteps: number | null, 
		
		readonly claimId: number | null
		// claimCount... how many times has a task been claimed without progress being written to it?
		// this will be helpful for tasks that are timing out.
	) {}
}

export class LongTaskRepositoryArray implements LongTaskRepository {
	table: Array <DataRow>;
	index: Array <string>;

	// This validator feels dirty, but I'm not sure how else to make sure the user doesn't feed
	// in an incorrect value.
	constructor(readonly validator: LongTaskStatusChangeValidator) {
		this.table = [];
		this.index = [];
	}

	public create(type: LongTaskType, params: LongTaskParameters, ownerId: UserId, searchKey: string | Array <string>): Promise <LongTaskId> {
		const taskType = type.value;
		const jsonParams = params.toJson();
		const identifier = this.newTaskIdentifier();
		const searchKeys = this.prepareSearchKeys(searchKey);
		const progressState = null;
		const progressCurrentStep = null;
		const progressMaximumSteps = null;
		const claimId = null;
		const row = new DataRow(
			identifier.value, 
			ownerId.value, 
			searchKeys, 
			taskType, 
			jsonParams, 
			LongTaskStatus.Queued, 
			progressState, 
			progressCurrentStep, 
			progressMaximumSteps, 
			claimId
		);

		this.table.push(row);
		this.index.push(identifier.value);
		
		return Promise.resolve(identifier);
	}

	private newTaskIdentifier(): LongTaskId {
		// Just for demo purposes in this file...
		const timestamp = new Date().getTime();
		const randomSequence = Math.random().toString(36).substring(4);
		const identifier = LongTaskId.withValue(timestamp + "_" + randomSequence);

		return identifier;
	}

	private prepareSearchKeys(searchKey: string | Array <string>): Array <string> {
		if (searchKey instanceof Array) {
			return searchKey;
		} else {
			return [searchKey];
		}
	}

	private indexForTaskId(taskId: LongTaskId): number {
		const index = this.index.indexOf(taskId.value);

		if (index < 0) {
			throw RangeError("The specified taskId does not exist.");
		} else {
			return index;
		}
	}

	public claim(taskId: LongTaskId, claimId: LongTaskClaim): Promise <boolean> {
		let index;

		try {
			index = this.indexForTaskId(taskId);
		} catch (error) {
			return Promise.resolve(false);
		}

		const row: DataRow = this.table[index];

		if (this.isClaimed(row)) {
			return Promise.resolve(false);
		}

		const status = LongTaskStatus.Processing;
		const updatedRow = new DataRow(
			row.identifier,
			row.ownerId,
			row.searchKey,
			row.type,
			row.params,
			status,
			row.progressState,
			row.progressCurrentStep,
			row.progressMaximumSteps,
			claimId.value
		);

		this.table[index] = updatedRow;
		return Promise.resolve(true);
	}

	private isClaimed(row: DataRow): boolean {
		return (row.claimId != null);
	}

	public release(taskId: LongTaskId): Promise <void> {		
		const index = this.indexForTaskId(taskId);
		const row: DataRow = this.table[index];

		if ( ! this.isClaimed(row)) {
			throw Error("The task is not claimed, and therefore cannot be released");
		}

		const status = LongTaskStatus.Queued;
		const claimId = null;
		const updatedRow = new DataRow(
			row.identifier,
			row.ownerId,
			row.searchKey,
			row.type,
			row.params,
			status,
			row.progressState,
			row.progressCurrentStep,
			row.progressMaximumSteps,
			claimId
		);

		this.table[index] = updatedRow;
		return Promise.resolve();
	}
	
	public getNextQueuedTasks(count: number): Promise <Array <LongTask>> {
		var nextTasks: Array <LongTask> = [];

		for (let row of this.table) {
			if (row.status == LongTaskStatus.Queued) {
				const task = this.hydrateTaskFrom(row);
				nextTasks.push(task);

				if (nextTasks.length >= count) {
					break;
				}
			}
		}

		return Promise.resolve(nextTasks);
	}

	private hydrateTaskFrom(row: DataRow): LongTask {
		const identifier = LongTaskId.withValue(row.identifier);
		const progress = LongTaskProgress.withStateCurrentStepAndMaximumSteps(
			row.progressState,
			row.progressCurrentStep, 
			row.progressMaximumSteps
		);
		const attributes = LongTaskAttributes.withTypeParamsStatusProgressClaim(
			row.type, 
			row.params, 
			row.status, 
			progress,
			row.claimId
		);
		const task = new LongTask(identifier, attributes);

		return task;
	}

	// Possibly remove this...
	public getProcessingTasksWithClaimOlderThanDurationFromDate(duration: Duration, date: Date): Promise <Array <LongTask>> {
		var tasks: Array <LongTask> = [];

		for (let row of this.table) {
			if (row.claimId) {
				const age = date.valueOf() - row.claimId;
				const expired = (age > duration.inMilliseconds());
				const processing = (row.status == LongTaskStatus.Processing);

				if (processing && expired) {
					const task = this.hydrateTaskFrom(row);
					tasks.push(task);
				}
			}
		}

		return Promise.resolve(tasks);
	}

	public update(taskId: LongTaskId, progress: LongTaskProgress, status: LongTaskStatus): Promise <void> {
		const index = this.indexForTaskId(taskId);
		const row = this.table[index];
		this.validateStatusUpdate(row.status, status);
		
		const claimHeartbeat = LongTaskClaim.withNowTimestamp();
		const updatedRow = new DataRow(
			row.identifier,
			row.ownerId,
			row.searchKey,
			row.type,
			row.params,
			status,
			progress.state,
			progress.currentStep,
			progress.maximumSteps,
			claimHeartbeat.value
		);

		this.table[index] = updatedRow;
		return Promise.resolve();
	}

	private validateStatusUpdate(existingStatus: LongTaskStatus, newStatus: LongTaskStatus) {
		if (this.validator.isInvalidStatusUpdate(existingStatus, newStatus)) {
			throw Error(this.validator.failureMessage());
		}
	}

	public cancel(taskId: LongTaskId): Promise <void> {
		const index = this.indexForTaskId(taskId);
		const row = this.table[index];
		this.validateStatusUpdate(row.status, LongTaskStatus.Cancelled);

		const status = LongTaskStatus.Cancelled;
		const claimHeartbeat = LongTaskClaim.withNowTimestamp();
		const updatedRow = new DataRow(
			row.identifier,
			row.ownerId,
			row.searchKey,
			row.type,
			row.params,
			status,
			row.progressState,
			row.progressCurrentStep,
			row.progressMaximumSteps,
			claimHeartbeat.value
		);

		this.table[index] = updatedRow;
		return Promise.resolve();
	}

	public delete(taskId: LongTaskId): Promise <void> {
		const index = this.indexForTaskId(taskId);
		this.table.splice(index, 1);
		this.index.splice(index, 1);
		return Promise.resolve();
	}

	public getTasksWithIds(ids: Array <LongTaskId>): Promise <Array <LongTask>> {
		var tasks: Array <LongTask> = [];

		for (let taskId of ids) {
			try {
				const index = this.indexForTaskId(taskId);
				const row: DataRow = this.table[index];
				const task = this.hydrateTaskFrom(row);
				tasks.push(task);
			} catch(error) {
				continue;
			}
		}

		return Promise.resolve(tasks);
	}

	public getTasksForSearchKey(key: string | Array <string>): Promise <Array <LongTask>> {
		let results: Array <LongTask> = [];
		let keys = this.prepareSearchKeys(key);

		// rewrite in a more functional way. TODO
		for (let row of this.table) {
			for (let aKey of keys) {
				const index = row.searchKey.indexOf(aKey);

				if (index > -1) {
					const task = this.hydrateTaskFrom(row);
					results.push(task);
					break;
				}
			}
		}
		
		return Promise.resolve(results);
	}

	public getTasksForUserId(identifier: UserId): Promise <Array <LongTask>> {
		let results: Array <LongTask> = [];

		// what's a functional way of writing this?
		for (let row of this.table) {
			if (row.ownerId == identifier.value) {
				const task = this.hydrateTaskFrom(row);
				results.push(task);
			}
		}

		return Promise.resolve(results);
	}
}