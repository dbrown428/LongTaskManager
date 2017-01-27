import {Option} from "./Option";
import {UserId} from "./UserId";
import {ClaimId} from "./ClaimId";
import {Promise} from 'es6-promise';
import {LongTask} from "./LongTask";
import {LongTaskId} from "./LongTaskId";
import {LongTaskProgress} from "./LongTaskProgress";
import {LongTaskRepository} from "./LongTaskRepository";
import {LongTaskAttributes, LongTaskStatus} from "./LongTaskAttributes";

// require("fs") TODO

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
		readonly claimId: string | null) {
	}
}

export class LongTaskRepositoryFileSystem implements LongTaskRepository {
	// Change to file system...
	table: Array <DataRow>;
	index: Array <string>;

	constructor() {
		// Change to file system...
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

			// Change to file system...
			this.table.push(row);
			this.index.push(identifier.value);
			resolve(identifier);
		});
	}

	private newTaskIdentifier(): LongTaskId {
		// Just for demo purposes. Not meant to be a decent UUID implementation.
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

	public claim(taskId: LongTaskId, claimId: ClaimId): Promise <boolean> {
		return new Promise((resolve, reject) => {
			const index = this.indexForTaskId(taskId);

			this.claimTaskAtIndex(index, claimId).then((claimed: boolean) => {
				resolve(claimed);
			}).catch((error) => {
				// row does not exist.
				resolve(false);
			});
		});
	}

	private claimTaskAtIndex(index: number, claimId: ClaimId): Promise <boolean> {
		return new Promise((resolve, reject) => {
			// Change to file system...
			const row: DataRow = this.table[index];

			if (this.isClaimed(row)) {
				resolve(false);
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

			// Change to file system...
			this.table[index] = updatedRow;
			resolve(true);
		});
	}

	private isClaimed(row: DataRow): boolean {
		return (row.claimId != null);
	}

	private indexForTaskId(taskId: LongTaskId): number {
		return this.index.indexOf(taskId.value);
	}
	
	public getNextTask(): Promise <Option <LongTask>> {
		return new Promise((resolve, reject) => {
			// Change to file system...
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
		const progress: LongTaskProgress = {
			state: row.progressState, 
			currentStep: row.progressCurrentStep, 
			maximumSteps: row.progressMaximumSteps
		};
		const attributes = new LongTaskAttributes(row.type, row.params, row.status, progress);
		const task = new LongTask(identifier, attributes);

		return task;
	}

	update(taskId: LongTaskId, progress: LongTaskProgress, status: LongTaskStatus): Promise <boolean> {
		return new Promise((resolve, reject) => {

			// todo

		});
	}

	cancel(taskId: LongTaskId): Promise <any> {
		return new Promise((resolve, reject) => {
			const index = this.indexForTaskId(taskId);
			const row = this.table[index];

			if (row.status == LongTaskStatus.Cancelled) {
				reject("The task was already cancelled.");
			} else {
				const status = LongTaskStatus.Cancelled;
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
					row.claimId
				);

				this.table[index] = updatedRow;
				resolve(undefined);
			}
		});
	}

	delete(taskId: LongTaskId): Promise <any> {
		return new Promise((resolve, reject) => {
			const index = this.indexForTaskId(taskId);

			if (index > -1) {
				this.table.splice(index, 1);
				this.index.splice(index, 1);
				resolve(undefined);
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