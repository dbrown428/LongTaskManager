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
		return new Promise((resolve, reject) => {
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

			this.table.push(row);
			this.index.push(identifier.value);
			resolve(identifier);
		});
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

	public claim(taskId: LongTaskId, claimId: LongTaskClaim): Promise <boolean> {
		return new Promise((resolve, reject) => {
			const index = this.indexForTaskId(taskId);

			this.claimTaskAtIndex(index, claimId).then((claimed: boolean) => {
				resolve(claimed);
			});
		});
	}

	private claimTaskAtIndex(index: number, claimId: LongTaskClaim): Promise <boolean> {
		return new Promise((resolve, reject) => {
			const row: DataRow = this.table[index];

			// how can this conditional be better organized?
			if (this.isClaimed(row)) {
				resolve(false);
			} else {
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
				resolve(true);
			}
		});
	}

	private isClaimed(row: DataRow): boolean {
		return (row.claimId != null);
	}

	public release(taskId: LongTaskId): Promise <boolean> {
		return new Promise((resolve, reject) => {
			const index = this.indexForTaskId(taskId);
			const row: DataRow = this.table[index];

			// how can this conditional be better organized?
			if (this.isClaimed(row)) {
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
				resolve(true);
			} else {
				resolve(false);
			}
		});
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
			progress
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

	public update(taskId: LongTaskId, progress: LongTaskProgress, status: LongTaskStatus): Promise <boolean> {
		return new Promise((resolve, reject) => {
			const index = this.indexForTaskId(taskId);
			const row = this.table[index];
			
			// this feels like it should be moved into the manager...
			// TODO
			
			if (row.status == LongTaskStatus.Cancelled && status == LongTaskStatus.Completed) {
				reject("Cannot change a cancelled task to completed.");
			} else if (row.status == LongTaskStatus.Queued && status != LongTaskStatus.Cancelled) {
				reject("You can only change a queued status to cancelled with an update.");
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
				resolve(true);
			}
		});
	}

	public cancel(taskId: LongTaskId): Promise <boolean> {
		return new Promise((resolve, reject) => {
			const index = this.indexForTaskId(taskId);
			const row = this.table[index];

			if (row.status == LongTaskStatus.Cancelled) {
				reject("The task was already cancelled.");
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
				resolve(true);
			}
		});
	}

	public delete(taskId: LongTaskId): Promise <boolean> {
		return new Promise((resolve, reject) => {
			const index = this.indexForTaskId(taskId);

			if (index > -1) {
				this.table.splice(index, 1);
				this.index.splice(index, 1);
				resolve(true);
			} else {
				reject("Could not find task with id '" + taskId.value + "' to delete.");
			}
		});
	}

	public getTasksForSearchKey(key: string): Promise <Array <LongTask>> {
		return new Promise((resolve, reject) => {
			let results: Array <LongTask> = [];
			
			for (let row of this.table) {
				const index = row.searchKey.indexOf(key);

				if (index > -1) {
					const task = this.hydrateTaskFrom(row);
					results.push(task);
				}
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
