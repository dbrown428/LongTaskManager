import {Promise} from 'es6-promise';
import {LongTask} from "./LongTask";
import {UserId} from "./Values/UserId";
import {Option} from "./Values/Option";
import {LongTaskId} from "./LongTaskId";
import {LongTaskClaim} from "./LongTaskClaim";
import {LongTaskProgress} from "./LongTaskProgress";
import {LongTaskRepository} from "./LongTaskRepository";
import {LongTaskAttributes, LongTaskStatus} from "./LongTaskAttributes";

export class LongTaskRepositoryMongo implements LongTaskRepository {
	constructor(readonly db: MongoClient) {}

	add(type: string, params: string, ownerId: UserId, searchKey: string | Array <string>): Promise <LongTaskId> {

		// db.collection().insertOne({}, () => {});

		return new Promise((resolve, reject) => {

			// TEMP
			resolve(new LongTaskId("3"));
		});
	}

	getNextTask(): Promise <Option <LongTask>> {
		return new Promise((resolve, reject) => {
			// TEMP
			const identifier = new LongTaskId("3");
			const progress = LongTaskProgress.none();
			const attributes = new LongTaskAttributes("awesome-job", "{students:[1,2,3,4], reportId:5}", LongTaskStatus.Queued, progress);
			const tempTask = new LongTask(identifier, attributes);
			resolve(tempTask);
		});
	}

	claim(taskId: LongTaskId, claim: LongTaskClaim): Promise <boolean> {
		return new Promise((resolve, reject) => {
			// TEMP
			resolve(true);
		});
	}

	update(taskId: LongTaskId, progress: LongTaskProgress, status: LongTaskStatus): Promise <boolean> {
		return new Promise((resolve, reject) => {
			// TEMP
			resolve(true);
		});
	}
	
	cancel(taskId: LongTaskId): Promise <any> {
		// would this be better as a boolean?
		return new Promise((resolve, reject) => {
			// TEMP
			resolve(undefined);
		});
	}

	delete(taskId: LongTaskId): Promise <any> {
		// would this be better as a boolean?
		return new Promise((resolve, reject) => {
			// TEMP
			resolve(undefined);
		});
	}

	getTasksForSearchKey(key: string): Promise <Array <LongTask>> {
		return new Promise((resolve, reject) => {
			// TEMP
			resolve([]);
		});
	}

	getTasksForUserId(identifier: UserId): Promise <Array <LongTask>> {
		return new Promise((resolve, reject) => {
			// TEMP
			resolve([]);
		});
	}
}
