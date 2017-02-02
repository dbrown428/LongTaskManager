import {Promise} from 'es6-promise';
import {UserId} from "../../../src/UserId";
import {LongTaskId} from "../../../src/LongTaskId";
import {LongTaskManager} from "../../../src/LongTaskManager";
import {LongTaskManagerConfiguration} from "../../../src/LongTaskManagerConfiguration";
import {PublishSummaryReportsTaskProcessorConfiguration} from "../../../src/PublishSummaryReportsTaskProcessorConfiguration";

class PublishSummaryReportsForStudents {
	constructor(readonly taskManager: LongTaskManager) {}

	execute(reportId: string, students: Array <UserId>, ownerId: UserId): Promise <LongTaskId> {
		return new Promise((resolve, reject) => {
			const searchKey = reportId;
			const params: {reportId: string, students: Array <UserId>} = {
				reportId: reportId,
				students: students,
			};

			// this wont be available... need to use a key from the LongTaskSystem Api.
			const taskType = PublishSummaryReportsTaskProcessorConfiguration.key();

			this.taskManager.addTask(taskType, params, ownerId, searchKey).then((taskId: LongTaskId) => {
				resolve(taskId);
			}).catch((error) => {

				// error adding the task to the manager
				// todo
			});
		});
	}
}
