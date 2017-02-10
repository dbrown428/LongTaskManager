import {Promise} from 'es6-promise';
import {LongTask} from "../../Domain/LongTask";
import {Option} from "../../Shared/Values/Option";
import {UserId} from "../../Shared/Values/UserId";
import {LongTaskId} from "../../Domain/LongTaskId";
import {Duration} from "../../Shared/Values/Duration";
import {LongTaskClaim} from "../../Domain/LongTaskClaim";
import {LongTaskProgress} from "../../Domain/LongTaskProgress";
import {LongTaskRepository} from "../../Domain/LongTaskRepository";
import {LongTaskAttributes, LongTaskStatus} from "../../Domain/LongTaskAttributes";

// Used to represent an entry in the table.
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
	) {}
}

export class LongTaskRepositoryArray implements LongTaskRepository {
	table: Array <DataRow>;
	index: Array <string>;

	constructor() {
		this.table = [];
		this.index = [];
	}

	public add(type: string, params: string, ownerId: UserId, searchKey: string | Array <string>): Promise <LongTaskId> {
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
			type, 
			params, 
			LongTaskStatus.Queued, 
			progressState, 
			progressCurrentStep, 
			progressMaximumSteps, 
			claimId
		);

		// Imagine this is blocking IO...
		this.table.push(row);
		this.index.push(identifier.value);
		
		return Promise.resolve(identifier);
	}

	private newTaskIdentifier(): LongTaskId {
		// Just for demo purposes in this file...
		const timestamp = new Date().getTime();
		const randomSequence = Math.random().toString(36).substring(4);
		const identifier = new LongTaskId(timestamp + "_" + randomSequence);

		return identifier;
	}

	private prepareSearchKeys(searchKey: string | Array <string>): Array <string> {
		if (searchKey instanceof Array) {
			return searchKey;
		} else {
			return [searchKey];
		}
	}

	public getTaskWithId(taskId: LongTaskId): Promise <Option <LongTask>> {
		const index = this.indexForTaskId(taskId);

		if (index > -1) {
			const row: DataRow = this.table[index];
			const task = this.hydrateTaskFrom(row);
			const option = Option.some(task);
			return Promise.resolve(option);
		} else {
			return Promise.resolve(Option.none());
		}
	}

	public claim(taskId: LongTaskId, claimId: LongTaskClaim): Promise <void> {
		const index = this.indexForTaskId(taskId);
		const row: DataRow = this.table[index];

		if (this.isClaimed(row)) {
			return Promise.reject("The task is already claimed");
		} else {
			return this.claimTaskAtIndex(row, index, claimId);
		}
	}

	private claimTaskAtIndex(row: DataRow, index: number, claimId: LongTaskClaim): Promise <void> {
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
		return Promise.resolve();
	}

	private isClaimed(row: DataRow): boolean {
		return (row.claimId != null);
	}

	public release(taskId: LongTaskId): Promise <void> {		
		const index = this.indexForTaskId(taskId);
		const row: DataRow = this.table[index];

		if (this.isClaimed(row)) {
			return this.releaseRowAtIndex(row, index);
		} else {
			return Promise.reject("The task is not claimed, and therefore cannot be released");
		}
	}

	private releaseRowAtIndex(row: DataRow, index: number): Promise <void> {
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

	private indexForTaskId(taskId: LongTaskId): number {
		return this.index.indexOf(taskId.value);
	}
	
	public getNextTask(): Promise <Option <LongTask>> {
		return new Promise((resolve, reject) => {
			for (let row of this.table) {
				if (row.status == LongTaskStatus.Queued) {
					const task = this.hydrateTaskFrom(row);
					const option = Option.some(task);
					resolve(option);
				}
			}

			resolve(Option.none());
		});
	}

	private hydrateTaskFrom(row: DataRow): LongTask {
		const identifier = new LongTaskId(row.identifier);
		const progress = LongTaskProgress.withStateCurrentStepAndMaximumSteps(
			row.progressState,
			row.progressCurrentStep, 
			row.progressMaximumSteps
		);
		const attributes = new LongTaskAttributes(
			row.type, 
			row.params, 
			row.status, 
			progress,
			row.claimId
		);
		const task = new LongTask(identifier, attributes);

		return task;
	}

	public getProcessingTasksWithClaimOlderThanDurationFromDate(duration: Duration, date: Date): Promise <Array <LongTask>> {
		return new Promise((resolve, reject) => {
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

			resolve(tasks);
		});
	}

	public update(taskId: LongTaskId, progress: LongTaskProgress, status: LongTaskStatus): Promise <void> {
		return new Promise((resolve: (content: void) => void, reject: (e: string) => void) => {
			// no error handling for taskId not found...
			const index = this.indexForTaskId(taskId);
			const row = this.table[index];
			
			// this feels like it should be moved into the manager...
			// TODO

			if (row.status == LongTaskStatus.Failed && status == LongTaskStatus.Completed) {
				reject("Cannot change a failed task to completed.");
				// throw ?
			} else if (row.status == LongTaskStatus.Cancelled && status == LongTaskStatus.Completed) {
				reject("Cannot change a cancelled task to completed.");
				// throw ?
			} else if (row.status == LongTaskStatus.Queued && status != LongTaskStatus.Cancelled) {
				reject("You can only change a queued status to cancelled with an update.");
				// throw ?
			} else {
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
				// resolve();??
				return;
			}
		});
	}

	public cancel(taskId: LongTaskId): Promise <void> {
		const index = this.indexForTaskId(taskId);
		const row = this.table[index];

		if (row.status == LongTaskStatus.Cancelled) {
			return Promise.reject("The task was already cancelled.");
		} else {
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
	}

	public delete(taskId: LongTaskId): Promise <void> {
		const index = this.indexForTaskId(taskId);

		if (index > -1) {
			this.table.splice(index, 1);
			this.index.splice(index, 1);
			return Promise.resolve();
		} else {
			return Promise.reject("Could not find task with id '" + taskId.value + "' to delete.");
		}
	}

	public getTasksForSearchKey(key: string | Array <string>): Promise <Array <LongTask>> {
		// update for array of search keys.
		// todo

		return new Promise((resolve, reject) => {
			let results: Array <LongTask> = [];
			
			for (let row of this.table) {

				// the key can be an array or a single string...
				// todo
				// const index = row.searchKey.indexOf(key);

				// if (index > -1) {
				// 	const task = this.hydrateTaskFrom(row);
				// 	results.push(task);
				// }
			}
		
			resolve(results);
		});
	}

	public getTasksForUserId(identifier: UserId): Promise <Array <LongTask>> {
		return new Promise((resolve, reject) => {
			let results: Array <LongTask> = [];

			for (let row of this.table) {
				if (row.ownerId == identifier.value) {
					const task = this.hydrateTaskFrom(row);
					results.push(task);
				}
			}

			resolve(results);
		});
	}
}
