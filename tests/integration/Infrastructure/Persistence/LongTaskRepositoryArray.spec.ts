import {assert} from "chai";
import {LongTask} from "../../../../src/Domain/LongTask";
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

describe("Long task repository array implementation", () => {
	describe("Create task", () => {
		it("should store the task attributes.", async () => {
			const validator = new LongTaskStatusChangeValidator;
			const repository = new LongTaskRepositoryArray(validator);
			const type = LongTaskType.withValue("awesome-job");
			const ownerId = UserId.withValue("4");
			const searchKey = "8";
			const params = new LongTaskParametersDummy;
			const taskId: LongTaskId = await repository.create(type, params, ownerId, searchKey);
			const nextTasks = await repository.getNextQueuedTasks(1);

			assert.lengthOf(nextTasks, 1);
			assert.equal(nextTasks[0].identifier.value, taskId.value);
		});
	});

	describe("Claim next tasks", () => {
		it("should return an empty array when there is no next task.", async () => {
			const validator = new LongTaskStatusChangeValidator;
			const repository = new LongTaskRepositoryArray(validator);
			const nextTasks = await repository.claimNextTasks(1);

			assert.lengthOf(nextTasks, 0);
		});

		it("should return the first of many queued tasks.", async () => {
			const validator = new LongTaskStatusChangeValidator;
			const repository = new LongTaskRepositoryArray(validator);
			const ownerId = UserId.withValue("6");
			const values: Array <LongTaskId> = await Promise.all([
				repository.create(LongTaskType.withValue("great-job"), new LongTaskParametersDummy, ownerId, "9"),
				repository.create(LongTaskType.withValue("fabulous-job"), new LongTaskParametersDummy, ownerId, "1"),
				repository.create(LongTaskType.withValue("awesome-job"), new LongTaskParametersDummy, ownerId, "2"),
			]);

			const nextTasks = await repository.getNextQueuedTasks(1);
			
			assert.lengthOf(nextTasks, 1);
			assert.equal(nextTasks[0].type(), "great-job");
		});

		it("Should return the first queued task.", async () => {
			const validator = new LongTaskStatusChangeValidator;
			const repository = new LongTaskRepositoryArray(validator);

			const values: Array <LongTaskId> = await Promise.all([
				repository.create(LongTaskType.withValue("great-job"), new LongTaskParametersDummy, UserId.withValue("2"), "9"),
				repository.create(LongTaskType.withValue("fabulous-job"), new LongTaskParametersDummy, UserId.withValue("1"), "3"),
				repository.create(LongTaskType.withValue("awesome-job"), new LongTaskParametersDummy, UserId.withValue("4"), "1"),
				repository.create(LongTaskType.withValue("sweet-job"), new LongTaskParametersDummy, UserId.withValue("6"), "10"),
			]);
			await Promise.all([
				repository.claim(values[0], LongTaskClaim.withNowTimestamp()),
				repository.claim(values[1], LongTaskClaim.withNowTimestamp()),
			]);

			const nextTasks = await repository.getNextQueuedTasks(1);
			assert.lengthOf(nextTasks, 1);
			assert.equal(nextTasks[0].type(), "awesome-job");
		});

		it("should return many queued tasks.", async () => {
			const validator = new LongTaskStatusChangeValidator;
			const repository = new LongTaskRepositoryArray(validator);

			const values: Array <LongTaskId> = await Promise.all([
				repository.create(LongTaskType.withValue("great-job"), new LongTaskParametersDummy, UserId.withValue("2"), "9"),
				repository.create(LongTaskType.withValue("fabulous-job"), new LongTaskParametersDummy, UserId.withValue("1"), "3"),
				repository.create(LongTaskType.withValue("awesome-job"), new LongTaskParametersDummy, UserId.withValue("4"), "1"),
				repository.create(LongTaskType.withValue("sweet-job"), new LongTaskParametersDummy, UserId.withValue("6"), "10"),
			]);
			await Promise.all([
				repository.claim(values[0], LongTaskClaim.withNowTimestamp()),
				repository.claim(values[2], LongTaskClaim.withNowTimestamp()),
			]);

			const nextTasks = await repository.getNextQueuedTasks(4);
			assert.lengthOf(nextTasks, 2);
			assert.equal(nextTasks[0].type(), "fabulous-job");
			assert.equal(nextTasks[1].type(), "sweet-job");
		});

		it("should return old processing jobs that ")
	});

	// redo...
	describe("Claim a Task", () => {
		it("Should be able to claim an unclaimed task.", async () => {
			const validator = new LongTaskStatusChangeValidator;
			const repository = new LongTaskRepositoryArray(validator);
			const taskId: LongTaskId = await repository.create(LongTaskType.withValue("great-job"), new LongTaskParametersDummy, UserId.withValue("5"), "3");
			
			const claimId = LongTaskClaim.withNowTimestamp();
			await repository.claim(taskId, claimId);
			const tasks = await repository.getTasksWithIds([taskId]);

			assert.lengthOf(tasks, 1);
			assert.isTrue(tasks[0].isClaimed());
		});

		it("Should not be able to claim an already claimed task.", async () => {
			const validator = new LongTaskStatusChangeValidator;
			const repository = new LongTaskRepositoryArray(validator);
			const taskId = await repository.create(LongTaskType.withValue("great-job"), new LongTaskParametersDummy, UserId.withValue("11"), "9")
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
			const taskId: LongTaskId = await repository.create(LongTaskType.withValue("sweet-job"), new LongTaskParametersDummy, UserId.withValue("3"), "happy");	
			
			await repository.claim(taskId, LongTaskClaim.withNowTimestamp());
			await repository.release(taskId);
			const tasks = await repository.getTasksWithIds([taskId]);

			assert.lengthOf(tasks, 1);
			assert.isFalse(tasks[0].isClaimed());
		});

		it("should retrieve processing tasks that have a expired.", async() => {
			const userId = UserId.withValue("456");
			const validator = new LongTaskStatusChangeValidator;
			const repository = new LongTaskRepositoryArray(validator);
			const taskIds: Array <LongTaskId> = await Promise.all([
				repository.create(LongTaskType.withValue("great-job"), new LongTaskParametersDummy, UserId.withValue("2"), "9"),
				repository.create(LongTaskType.withValue("fabulous-job"), new LongTaskParametersDummy, userId, "3"),
				repository.create(LongTaskType.withValue("awesome-job"), new LongTaskParametersDummy, UserId.withValue("4"), "1"),
				repository.create(LongTaskType.withValue("sweet-job"), new LongTaskParametersDummy, userId, "10"),
			]);
			const date = new Date();
			const oldDate = Date.now() - 4000;
			const duration = Duration.withSeconds(2);

			// REDO
			await Promise.all([
				repository.claim(taskIds[0], LongTaskClaim.withNowTimestamp()),
				repository.claim(taskIds[1], LongTaskClaim.withExistingTimestamp(oldDate)),
				repository.claim(taskIds[2], LongTaskClaim.withNowTimestamp()),
			]);

			// REVIEW

			const tasks = await repository.getProcessingTasksWithClaimOlderThanDurationFromDate(duration, date);
			assert.lengthOf(tasks, 1);
			assert.equal(tasks[0].type(), "fabulous-job");
		});
	});

	describe("Update task", () => {
		it("should update progress and status.", async () => {
			const validator = new LongTaskStatusChangeValidator;
			const repository = new LongTaskRepositoryArray(validator);
			const status = LongTaskStatus.Processing;
			const progress = LongTaskProgress.withStateCurrentStepAndMaximumSteps("{successful-student-ids:[1,2],failed-student-ids:[3], failure-message:['Missing student.']}", 4, 5);

			const taskId: LongTaskId = await repository.create(LongTaskType.withValue("fun-job"), new LongTaskParametersDummy, UserId.withValue("6"), "9");
			await repository.claim(taskId, LongTaskClaim.withNowTimestamp());
			await repository.update(taskId, progress, status);
			const tasks = await repository.getTasksWithIds([taskId]);

			assert.lengthOf(tasks, 1);
			const task = tasks[0];
			assert.equal(task.progressCurrentStep(), 4);
			assert.equal(task.progressMaximumSteps(), 5);
		});
	});
	
	describe("Cancel Task", () => {
		it("should cancel a task.", async () => {
			const validator = new LongTaskStatusChangeValidator;
			const repository = new LongTaskRepositoryArray(validator);
			const userId = UserId.withValue("11");
			const taskId: LongTaskId = await repository.create(LongTaskType.withValue("great-job"), new LongTaskParametersDummy, userId, "9");

			await repository.cancel(taskId);
			const tasks = await repository.getTasksWithIds([taskId]);
			
			assert.lengthOf(tasks, 1);
			assert.isTrue(tasks[0].isCancelled());
		});
	});

	describe("Delete task", () => {
		it("should delete a task regardless of it's status.", async () => {
			const validator = new LongTaskStatusChangeValidator;
			const repository = new LongTaskRepositoryArray(validator);
			const taskIds: Array <LongTaskId> = await Promise.all([
				repository.create(LongTaskType.withValue("great-job"), new LongTaskParametersDummy, UserId.withValue("2"), "9"),
				repository.create(LongTaskType.withValue("fabulous-job"), new LongTaskParametersDummy, UserId.withValue("1"), "3"),
				repository.create(LongTaskType.withValue("awesome-job"), new LongTaskParametersDummy, UserId.withValue("4"), "1"),
			]);

			await repository.delete(taskIds[0]);
			const nextTasks = await repository.getNextQueuedTasks(1);
		
			assert.lengthOf(nextTasks, 1);
			assert.equal(nextTasks[0].type(), "fabulous-job");
		});

		it("should result in an error when trying to delete a task that doesn't exist.", async () => {
			const validator = new LongTaskStatusChangeValidator;
			const repository = new LongTaskRepositoryArray(validator);
			const taskIds: Array <LongTaskId> = await Promise.all([
				repository.create(LongTaskType.withValue("great-job"), new LongTaskParametersDummy, UserId.withValue("2"), "9"),
				repository.create(LongTaskType.withValue("fabulous-job"), new LongTaskParametersDummy, UserId.withValue("1"), "3"),
				repository.create(LongTaskType.withValue("awesome-job"), new LongTaskParametersDummy, UserId.withValue("4"), "1"),
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
				repository.create(LongTaskType.withValue("great-job"), new LongTaskParametersDummy, UserId.withValue("2"), "9"),
				repository.create(LongTaskType.withValue("fabulous-job"), new LongTaskParametersDummy, UserId.withValue("1"), "3"),
				repository.create(LongTaskType.withValue("awesome-job"), new LongTaskParametersDummy, UserId.withValue("4"), "1"),
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
				repository.create(LongTaskType.withValue("great-job"), new LongTaskParametersDummy, UserId.withValue("2"), "9"),
				repository.create(LongTaskType.withValue("fabulous-job"), new LongTaskParametersDummy, UserId.withValue("1"), "3"),
				repository.create(LongTaskType.withValue("awesome-job"), new LongTaskParametersDummy, UserId.withValue("4"), "1"),
			]);

			const retrieveIds = [sampleTaskIds[0], sampleTaskIds[2], LongTaskId.withValue("123"), LongTaskId.withValue("456")];
			const tasks = await repository.getTasksWithIds(retrieveIds);

			assert.lengthOf(tasks, 2);
			assert.equal(tasks[0].identifier.value, sampleTaskIds[0].value);
			assert.equal(tasks[1].identifier.value, sampleTaskIds[2].value);
		});
	});
	
	describe("Tasks with search key", () => {
		it("should return an empty array when no tasks have the specified search key.", async () => {
			const validator = new LongTaskStatusChangeValidator;
			const repository = new LongTaskRepositoryArray(validator);
			await Promise.all([
				repository.create(LongTaskType.withValue("great-job"), new LongTaskParametersDummy, UserId.withValue("2"), "9"),
				repository.create(LongTaskType.withValue("fabulous-job"), new LongTaskParametersDummy, UserId.withValue("1"), "3"),
				repository.create(LongTaskType.withValue("awesome-job"), new LongTaskParametersDummy, UserId.withValue("4"), "1"),
				repository.create(LongTaskType.withValue("sweet-job"), new LongTaskParametersDummy, UserId.withValue("6"), "10"),
			]);
			
			const tasks: Array <LongTask> = await repository.getTasksForSearchKey("hello");
			assert.lengthOf(tasks, 0);
		});

		it("should return an array of tasks when tasks have the specified search key.", async () => {
			const validator = new LongTaskStatusChangeValidator;
			const repository = new LongTaskRepositoryArray(validator);
			const key = "hello";
			const values: Array <LongTaskId> = await Promise.all([
				repository.create(LongTaskType.withValue("great-job"), new LongTaskParametersDummy, UserId.withValue("2"), key),
				repository.create(LongTaskType.withValue("fabulous-job"), new LongTaskParametersDummy, UserId.withValue("1"), "3"),
				repository.create(LongTaskType.withValue("awesome-job"), new LongTaskParametersDummy, UserId.withValue("4"), key),
				repository.create(LongTaskType.withValue("sweet-job"), new LongTaskParametersDummy, UserId.withValue("6"), ["10", key]),
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
				repository.create(LongTaskType.withValue("great-job"), new LongTaskParametersDummy, UserId.withValue("2"), "9"),
				repository.create(LongTaskType.withValue("fabulous-job"), new LongTaskParametersDummy, UserId.withValue("1"), "3"),
				repository.create(LongTaskType.withValue("awesome-job"), new LongTaskParametersDummy, UserId.withValue("4"), "1"),
				repository.create(LongTaskType.withValue("sweet-job"), new LongTaskParametersDummy, UserId.withValue("6"), "10"),
			])
			
			const tasks: Array <LongTask> = await repository.getTasksForUserId(UserId.withValue("456"));
			assert.lengthOf(tasks, 0);
		});

		it("should return an array of tasks when, one or more, tasks were created by the specified user id.", async () => {
			const userId = UserId.withValue("456");
			const validator = new LongTaskStatusChangeValidator;
			const repository = new LongTaskRepositoryArray(validator);

			const values: Array <LongTaskId> = await Promise.all([
				repository.create(LongTaskType.withValue("great-job"), new LongTaskParametersDummy, UserId.withValue("2"), "9"),
				repository.create(LongTaskType.withValue("fabulous-job"), new LongTaskParametersDummy, userId, "3"),
				repository.create(LongTaskType.withValue("awesome-job"), new LongTaskParametersDummy, UserId.withValue("4"), "1"),
				repository.create(LongTaskType.withValue("sweet-job"), new LongTaskParametersDummy, userId, "10"),
			]);

			const tasks: Array <LongTask> = await repository.getTasksForUserId(userId);
			assert.lengthOf(tasks, 2);
		});
	});
});
