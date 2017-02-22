import {assert} from "chai";
import {LongTask} from "../../../../src/Domain/LongTask";
import {Option} from "../../../../src/Shared/Values/Option";
import {UserId} from "../../../../src/Shared/Values/UserId";
import {LongTaskId} from "../../../../src/Domain/LongTaskId";
import {Duration} from "../../../../src/Shared/Values/Duration";
import {LongTaskType} from "../../../../src/Domain/LongTaskType";
import {LongTaskClaim} from "../../../../src/Domain/LongTaskClaim";
import {LongTaskProgress} from "../../../../src/Domain/LongTaskProgress";
import {LongTaskParametersDummy} from "../../../doubles/LongTaskParametersDummy";
import {LongTaskAttributes, LongTaskStatus} from "../../../../src/Domain/LongTaskAttributes";
import {LongTaskStatusChangeValidator} from "../../../../src/Domain/LongTaskStatusChangeValidator";
import {LongTaskRepositoryArray} from "../../../../src/Infrastructure/Persistence/LongTaskRepositoryArray";

// This could be a mongo or array implmentation test...
// it should result in the same thing.

describe("Long task repository array implementation", () => {
	describe("Add task", () => {
		it("should store the task attributes.", async () => {
			const validator = new LongTaskStatusChangeValidator;
			const repository = new LongTaskRepositoryArray(validator);
			const type = LongTaskType.withValue("awesome-job");
			const ownerId = new UserId("4");
			const searchKey = "8";
			const params = LongTaskParametersDummy.withJson("{students:[1,2,3,4], reportId:5}");
			const taskId: LongTaskId = await repository.add(type, params, ownerId, searchKey);
			const nextTask: Option <LongTask> = await repository.getNextTask();

			assert.isTrue(nextTask.isDefined());
		});
	});

	describe("Next Task", () => {
		it("should return an empty option when there is no next task.", async () => {
			const validator = new LongTaskStatusChangeValidator;
			const repository = new LongTaskRepositoryArray(validator);
			const nextTask: Option <LongTask> = repository.getNextTask();

			assert.isTrue(nextTask.isEmpty());
		});

		it("Should return the first of many queued tasks.", async () => {
			const validator = new LongTaskStatusChangeValidator;
			const repository = new LongTaskRepositoryArray(validator);
			const ownerId = new UserId("6");
			const values: Array <LongTaskId> = await Promise.all([
				repository.add(LongTaskType.withValue("great-job"), LongTaskParametersDummy.withJson("{teacherId:3, classroomId: 9}"), ownerId, "9"),
				repository.add(LongTaskType.withValue("fabulous-job"), LongTaskParametersDummy.withJson("{students:[3,2,1], classroomId: 10}"), ownerId, "1"),
				repository.add(LongTaskType.withValue("awesome-job"), LongTaskParametersDummy.withJson("{students:[1,2,3,4], reportId: 1}"), ownerId, "2"),
			]);

			const nextTask: Option <LongTask> = await repository.getNextTask();
			
			assert.isTrue(nextTask.isDefined());
			assert.equal(nextTask.get().type(), "great-job");
		});

		it("Should return the first queued task.", async () => {
			const validator = new LongTaskStatusChangeValidator;
			const repository = new LongTaskRepositoryArray(validator);

			const values: Array <LongTaskId> = await Promise.all([
				repository.add(LongTaskType.withValue("great-job"), LongTaskParametersDummy.withJson("{teacherId:3, classroomId: 9}"), new UserId("2"), "9"),
				repository.add(LongTaskType.withValue("fabulous-job"), LongTaskParametersDummy.withJson("{students:[3,2,1], classroomId: 10}"), new UserId("1"), "3"),
				repository.add(LongTaskType.withValue("awesome-job"), LongTaskParametersDummy.withJson("{students:[1,2,3,4], reportId: 1}"), new UserId("4"), "1"),
				repository.add(LongTaskType.withValue("sweet-job"), LongTaskParametersDummy.withJson("{students:[9,10], teacher: 7}"), new UserId("6"), "10"),
			]);
			await Promise.all([
				repository.claim(values[0], LongTaskClaim.withNowTimestamp()),
				repository.claim(values[1], LongTaskClaim.withNowTimestamp()),
			]);

			const nextTask: Option <LongTask> = await repository.getNextTask();
			assert.isTrue(nextTask.isDefined());
			assert.equal(nextTask.get().type(), "awesome-job");
		});
	});

	describe("Claim a Task", () => {
		it("Should be able to claim an unclaimed task.", async () => {
			const validator = new LongTaskStatusChangeValidator;
			const repository = new LongTaskRepositoryArray(validator);
			const taskId: LongTaskId = await repository.add(LongTaskType.withValue("great-job"), LongTaskParametersDummy.withJson("{teacherId:3, classroomId:9}"), new UserId("5"), "3");
			
			const claimId = LongTaskClaim.withNowTimestamp();
			await repository.claim(taskId, claimId);
			const tasks = await repository.getTasksWithIds([taskId]),

			assert.lengthOf(tasks, 1);
			assert.isTrue(tasks[0].isClaimed());
		});

		it("Should not be able to claim an already claimed task.", async () => {
			const validator = new LongTaskStatusChangeValidator;
			const repository = new LongTaskRepositoryArray(validator);
			const taskId = await repository.add(LongTaskType.withValue("great-job"), LongTaskParametersDummy.withJson("{teacherId:3, classroomId:9}"), new UserId("11"), "9")
			const values = await Promise.all([
				repository.claim(taskId, LongTaskClaim.withNowTimestamp()),
				repository.claim(taskId, LongTaskClaim.withNowTimestamp()),
			]);

			assert.isTrue(values[0]);
			assert.isFalse(values[1]);
		});

		it("Should be able to release a claimed task.", async () => {
			const validator = new LongTaskStatusChangeValidator;
			const repository = new LongTaskRepositoryArray(validator);
			const taskId: LongTaskId = await repository.add(LongTaskType.withValue("sweet-job"), LongTaskParametersDummy.withJson("{teacherId: 2, classroomId:8}"), new UserId("3"), "happy");	
			
			await repository.claim(taskId, LongTaskClaim.withNowTimestamp());
			await repository.release(taskId);
			const task = await repository.getTasksWithIds([taskId]);

			assert.lengthOf(tasks, 1);
			assert.isFalse(tasks[0].isClaimed());
		});
	});

	describe("Update task", () => {
		it("should update progress and status.", async () => {
			const validator = new LongTaskStatusChangeValidator;
			const repository = new LongTaskRepositoryArray(validator);
			const status = LongTaskStatus.Processing;
			const progress = LongTaskProgress.withStateCurrentStepAndMaximumSteps("{successful-student-ids:[1,2],failed-student-ids:[3], failure-message:['Missing student.']}", 4, 5);

			const taskId: LongTaskId = await repository.add(LongTaskType.withValue("fun-job"), LongTaskParametersDummy.withJson("{teacher:2, students:[1,2,3,4,5]}"), new UserId("6"), "9");
			await repository.claim(taskId, LongTaskClaim.withNowTimestamp());
			await repository.update(taskId, progress, status);
			const tasks = await repository.getTasksWithIds([taskId]);

			assert.lenghtOf(tasks, 1);
			const task = tasks[0];
			assert.equal(task.progressCurrentStep(), 4);
			assert.equal(task.progressMaximumSteps(), 5);
		});
	});
	
	describe("Cancel Task", () => {
		it("should cancel a task.", async () => {
			const validator = new LongTaskStatusChangeValidator;
			const repository = new LongTaskRepositoryArray(validator);
			const userId = new UserId("11");
			const taskId: LongTaskId = await repository.add(LongTaskType.withValue("great-job"), LongTaskParametersDummy.withJson("{teacherId:3, classroomId:9}"), userId, "9");

			await repository.cancel(taskId);
			const tasks = await repository.getTasksWithIds([taskId]);
			
			assert.lenghtOf(tasks, 1);
			assert.isTrue(tasks[0].isCancelled());
		});
	});

	describe("Delete task", () => {
		it("should delete a task regardless of it's status.", async () => {
			const validator = new LongTaskStatusChangeValidator;
			const repository = new LongTaskRepositoryArray(validator);
			const taskIds: Array <LongTaskId> = await Promise.all([
				repository.add(LongTaskType.withValue("great-job"), LongTaskParametersDummy.withJson("{teacherId:3, classroomId: 9}"), new UserId("2"), "9"),
				repository.add(LongTaskType.withValue("fabulous-job"), LongTaskParametersDummy.withJson("{students:[3,2,1], classroomId: 10}"), new UserId("1"), "3"),
				repository.add(LongTaskType.withValue("awesome-job"), LongTaskParametersDummy.withJson("{students:[1,2,3,4], reportId: 1}"), new UserId("4"), "1"),
			]);

			await repository.delete(taskIds[0]);
			const nextTask: Option <LongTask> = await repository.getNextTask();
		
			assert.isTrue(nextTask.isDefined());
			assert.equal(nextTask.get().type(), "fabulous-job");
		});

		it("should result in an error when trying to delete a task that doesn't exist.", async () => {
			const validator = new LongTaskStatusChangeValidator;
			const repository = new LongTaskRepositoryArray(validator);
			const taskIds: Array <LongTaskId> = await Promise.all([
				repository.add(LongTaskType.withValue("great-job"), LongTaskParametersDummy.withJson("{teacherId:3, classroomId: 9}"), new UserId("2"), "9"),
				repository.add(LongTaskType.withValue("fabulous-job"), LongTaskParametersDummy.withJson("{students:[3,2,1], classroomId: 10}"), new UserId("1"), "3"),
				repository.add(LongTaskType.withValue("awesome-job"), LongTaskParametersDummy.withJson("{students:[1,2,3,4], reportId: 1}"), new UserId("4"), "1"),
			]);

			await repository.delete(taskIds[0]);
			
			try {
				await repository.delete(taskIds[0]);
			} catch (error) {
				assert.isNotNull(error);
			}
		});
	});

	describe("Tasks with ids", () => {
		it("should return an empty array when no task ids have been specified.", async () => {
			const validator = new LongTaskStatusChangeValidator;
			const repository = new LongTaskRepositoryArray(validator);
			const tasks = await repository.getTasksWithIds([]);
			assert.lengthOf(tasks, 0);
		});

		it("should return an array of tasks for a list of taskIds.", async () => {
			const validator = new LongTaskStatusChangeValidator;
			const repository = new LongTaskRepositoryArray(validator);
			const sampleTaskIds = await Promise.all([
				repository.add(LongTaskType.withValue("great-job"), LongTaskParametersDummy.withJson("{teacherId:3, classroomId: 9}"), new UserId("2"), "9"),
				repository.add(LongTaskType.withValue("fabulous-job"), LongTaskParametersDummy.withJson("{students:[3,2,1], classroomId: 10}"), new UserId("1"), "3"),
				repository.add(LongTaskType.withValue("awesome-job"), LongTaskParametersDummy.withJson("{students:[1,2,3,4], reportId: 1}"), new UserId("4"), "1"),
			]);

			const retrieveIds = [sampleTaskIds[0], sampleTaskIds[2]];
			const tasks = await repository.getTasksWithIds(retrieveIds);

			assert.lengthOf(tasks, 2);
			assert.equal(tasks[0].identifier.value, sampleTaskIds[0].value);
			assert.equal(tasks[1].identifier.value, sampleTaskIds[2].value);
		});

		it("should return an array of tasks even when one or more taskIds do not exist.", async () => {
			const validator = new LongTaskStatusChangeValidator;
			const repository = new LongTaskRepositoryArray(validator);
			const sampleTaskIds = await Promise.all([
				repository.add(LongTaskType.withValue("great-job"), LongTaskParametersDummy.withJson("{teacherId:3, classroomId: 9}"), new UserId("2"), "9"),
				repository.add(LongTaskType.withValue("fabulous-job"), LongTaskParametersDummy.withJson("{students:[3,2,1], classroomId: 10}"), new UserId("1"), "3"),
				repository.add(LongTaskType.withValue("awesome-job"), LongTaskParametersDummy.withJson("{students:[1,2,3,4], reportId: 1}"), new UserId("4"), "1"),
			]);

			const retrieveIds = [sampleTaskIds[0], sampleTaskIds[2], LongTaskId.withValue("123"), LongTaskId.withValue("456")];
			const tasks = await repository.getTasksWithIds(retrieveIds);

			assert.lengthOf(tasks, 2);
			assert.equal(tasks[0].identifier, sampleTaskIds[0]);
			assert.equal(tasks[1].identifier, sampleTaskIds[2]);
		});
	});
	
	describe("Tasks with search key", () => {
		it("should return an empty array when no tasks have the specified search key.", async () => {
			const validator = new LongTaskStatusChangeValidator;
			const repository = new LongTaskRepositoryArray(validator);
			await Promise.all([
				repository.add(LongTaskType.withValue("great-job"), LongTaskParametersDummy.withJson("{teacherId:3, classroomId: 9}"), new UserId("2"), "9"),
				repository.add(LongTaskType.withValue("fabulous-job"), LongTaskParametersDummy.withJson("{students:[3,2,1], classroomId: 10}"), new UserId("1"), "3"),
				repository.add(LongTaskType.withValue("awesome-job"), LongTaskParametersDummy.withJson("{students:[1,2,3,4], reportId: 1}"), new UserId("4"), "1"),
				repository.add(LongTaskType.withValue("sweet-job"), LongTaskParametersDummy.withJson("{students:[9,10], teacher: 7}"), new UserId("6"), "10"),
			]);
			
			const tasks: Array <LongTask> = await repository.getTasksForSearchKey("hello");
			assert.lengthOf(tasks, 0);
		});

		it("should return an array of tasks when tasks have the specified search key.", async () => {
			const validator = new LongTaskStatusChangeValidator;
			const repository = new LongTaskRepositoryArray(validator);
			const key = "hello";
			const values: Array <LongTaskId> = await Promise.all([
				repository.add(LongTaskType.withValue("great-job"), LongTaskParametersDummy.withJson("{teacherId:3, classroomId: 9}"), new UserId("2"), key),
				repository.add(LongTaskType.withValue("fabulous-job"), LongTaskParametersDummy.withJson("{students:[3,2,1], classroomId: 10}"), new UserId("1"), "3"),
				repository.add(LongTaskType.withValue("awesome-job"), LongTaskParametersDummy.withJson("{students:[1,2,3,4], reportId: 1}"), new UserId("4"), key),
				repository.add(LongTaskType.withValue("sweet-job"), LongTaskParametersDummy.withJson("{students:[9,10], teacher: 7}"), new UserId("6"), ["10", key]),
			]);

			const tasks: Array <LongTask> = await repository.getTasksForSearchKey(key);
			assert.lengthOf(tasks, 3);
		});
	});

	describe("Tasks with UserId", () => {
		it("should return an empty array when no tasks were created with the specified user id.", async () => {
			const validator = new LongTaskStatusChangeValidator;
			const repository = new LongTaskRepositoryArray(validator);
			const values: Array <LongTaskId> = await Promise.all([
				repository.add(LongTaskType.withValue("great-job"), LongTaskParametersDummy.withJson("{teacherId:3, classroomId: 9}"), new UserId("2"), "9"),
				repository.add(LongTaskType.withValue("fabulous-job"), LongTaskParametersDummy.withJson("{students:[3,2,1], classroomId: 10}"), new UserId("1"), "3"),
				repository.add(LongTaskType.withValue("awesome-job"), LongTaskParametersDummy.withJson("{students:[1,2,3,4], reportId: 1}"), new UserId("4"), "1"),
				repository.add(LongTaskType.withValue("sweet-job"), LongTaskParametersDummy.withJson("{students:[9,10], teacher: 7}"), new UserId("6"), "10"),
			])
			
			const tasks: Array <LongTask> = await repository.getTasksForUserId(new UserId("456"));
			assert.lengthOf(tasks, 0);
		});

		it("should return an array of tasks when, one or more, tasks were created by the specified user id.", async () => {
			const userId = new UserId("456");
			const validator = new LongTaskStatusChangeValidator;
			const repository = new LongTaskRepositoryArray(validator);

			const values: Array <LongTaskId> = await Promise.all([
				repository.add(LongTaskType.withValue("great-job"), LongTaskParametersDummy.withJson("{teacherId:3, classroomId: 9}"), new UserId("2"), "9"),
				repository.add(LongTaskType.withValue("fabulous-job"), LongTaskParametersDummy.withJson("{students:[3,2,1], classroomId: 10}"), userId, "3"),
				repository.add(LongTaskType.withValue("awesome-job"), LongTaskParametersDummy.withJson("{students:[1,2,3,4], reportId: 1}"), new UserId("4"), "1"),
				repository.add(LongTaskType.withValue("sweet-job"), LongTaskParametersDummy.withJson("{students:[9,10], teacher: 7}"), userId, "10"),
			]);

			const tasks: Array <LongTask> = repository.getTasksForUserId(userId);
			assert.lengthOf(tasks, 2);
		});
	});

	// remove...
	describe("Tasks older than duration", () => {
		it("should retrieve processing tasks that have a expired.", () => {
			const userId = new UserId("456");
			const validator = new LongTaskStatusChangeValidator;
			const repository = new LongTaskRepositoryArray(validator);
			const taskIds: Array <LongTaskId> = await Promise.all([
				repository.add(LongTaskType.withValue("great-job"), LongTaskParametersDummy.withJson("{teacherId:3, classroomId: 9}"), new UserId("2"), "9"),
				repository.add(LongTaskType.withValue("fabulous-job"), LongTaskParametersDummy.withJson("{students:[3,2,1], classroomId: 10}"), userId, "3"),
				repository.add(LongTaskType.withValue("awesome-job"), LongTaskParametersDummy.withJson("{students:[1,2,3,4], reportId: 1}"), new UserId("4"), "1"),
				repository.add(LongTaskType.withValue("sweet-job"), LongTaskParametersDummy.withJson("{students:[9,10], teacher: 7}"), userId, "10"),
			]);
			const date = new Date();
			const oldDate = Date.now() - 4000;
			const duration = Duration.withSeconds(2);

			await Promise.all([
				repository.claim(taskIds[0], LongTaskClaim.withNowTimestamp()),
				repository.claim(taskIds[1], LongTaskClaim.withExistingTimestamp(oldDate)),
				repository.claim(taskIds[2], LongTaskClaim.withNowTimestamp()),
			]);

			const tasks = await repository.getProcessingTasksWithClaimOlderThanDurationFromDate(duration, date);
			assert.lengthOf(tasks, 1);
			assert.equal(tasks[0].type(), "fabulous-job");
		});
	});
});
