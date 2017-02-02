import {assert} from "chai";
import {Promise} from "es6-promise";
import {Option} from "../../../../src/Shared/Values/Option";
import {UserId} from "../../../../src/Shared/Values/UserId";
import {LongTask} from "../../../../src/Domain/LongTask";
import {LongTaskId} from "../../../../src/Domain/LongTaskId";
import {LongTaskClaim} from "../../../../src/Domain/LongTaskClaim";
import {LongTaskProgress} from "../../../../src/Domain/LongTaskProgress";
import {LongTaskAttributes, LongTaskStatus} from "../../../../src/Domain/LongTaskAttributes";
import {LongTaskRepositoryArray} from "../../../../src/Infrastructure/Persistence/LongTaskRepositoryArray";

describe("Long task repository array implementation", () => {
	describe("Add Task", () => {
		it("Should add task attributes to the list.", () => {
			const repository = new LongTaskRepositoryArray;
			const type = "awesome-job";
			const ownerId = new UserId("4");
			const searchKey = "8";
			const params = "{students:[1,2,3,4], reportId:5}";

			return Promise.resolve().then(() => {
				return repository.add(type, params, ownerId, searchKey);
			}).then(() => {
				return repository.getNextTask();
			}).then((nextTask: Option <LongTask>) => {
				assert.isTrue(nextTask.isDefined());
			});
		});
	});

	describe("Next Task", () => {
		it("Should return an empty option when there is no next task.", () => {
			const repository = new LongTaskRepositoryArray;

			return Promise.resolve().then(() => {
				return repository.getNextTask();
			}).then((nextTask: Option <LongTask>) => {
				assert.isTrue(nextTask.isEmpty());
			});
		});

		it("Should return the first of many queued tasks.", () => {
			const repository = new LongTaskRepositoryArray;
			const ownerId = new UserId("6");

			return Promise.all([
				repository.add("great-job", "{teacherId:3, classroomId: 9}", ownerId, "9"),
				repository.add("fabulous-job", "{students:[3,2,1], classroomId: 10}", ownerId, "1"),
				repository.add("awesome-job", "{students:[1,2,3,4], reportId: 1}", ownerId, "2"),
			]).then(() => {
				return repository.getNextTask();
			}).then((nextTask: Option <LongTask>) => {
				assert.isTrue(nextTask.isDefined());

				if(nextTask.isDefined()) {
					assert.equal("great-job", nextTask.get().attributes.type);
				}
			});
		});

		it("Should return the first queued task.", () => {
			const repository = new LongTaskRepositoryArray;

			return Promise.all([
				repository.add("great-job", "{teacherId:3, classroomId: 9}", new UserId("2"), "9"),
				repository.add("fabulous-job", "{students:[3,2,1], classroomId: 10}", new UserId("1"), "3"),
				repository.add("awesome-job", "{students:[1,2,3,4], reportId: 1}", new UserId("4"), "1"),
				repository.add("sweet-job", "{students:[9,10], teacher: 7}", new UserId("6"), "10"),
			]).then((values: Array <LongTaskId>) => {
				return Promise.all([
					repository.claim(values[0], LongTaskClaim.withNowTimestamp()),
					repository.claim(values[1], LongTaskClaim.withNowTimestamp()),
				]);
			}).then((values: Array <boolean>) => {
				return repository.getNextTask();
			}).then((nextTask: Option <LongTask>) => {
				assert.isTrue(nextTask.isDefined());

				if (nextTask.isDefined()) {
					assert.equal("awesome-job", nextTask.get().attributes.type);
				}
			});
		});
	});

	describe("Claim a Task", () => {
		it("Should be able to claim an unclaimed task.", () => {
			const repository = new LongTaskRepositoryArray;

			return Promise.resolve().then(() => {
				return repository.add("great-job", "{teacherId:3, classroomId:9}", new UserId("5"), "3");
			}).then((taskId: LongTaskId) => {
				const claimId = LongTaskClaim.withNowTimestamp();
				return repository.claim(taskId, claimId);
			}).then((claimed: boolean) => {
				assert.isTrue(claimed);
			});
		});

		it("Should not be able to claim an already claimed task.", () => {
			const repository = new LongTaskRepositoryArray;

			return Promise.resolve().then(() => {
				return repository.add("great-job", "{teacherId:3, classroomId:9}", new UserId("11"), "9");
			}).then((taskId: LongTaskId) => {
				return Promise.all([
					repository.claim(taskId, LongTaskClaim.withNowTimestamp()),
					repository.claim(taskId, LongTaskClaim.withNowTimestamp()),
				]);
			}).then((values: Array <boolean>) => {
				assert.isTrue(values[0]);
				assert.isFalse(values[1]);
			});
		});

		it("Should be able to release a claimed task.", () => {
			const repository = new LongTaskRepositoryArray;

			return Promise.resolve().then(() => {
				return repository.add("sweet-job", "{teacherId: 2, classroomId:8}", new UserId("3"), "happy");
			}).then((taskId: LongTaskId) => {
				const taskIds = [taskId];

				return Promise.all([
					repository.claim(taskId, LongTaskClaim.withNowTimestamp()),
					repository.release(taskIds),
				]);
			}).then((values: Array <boolean>) => {
				return repository.getNextTask();
			}).then((nextTask: Option <LongTask>) => {
				assert.isTrue(nextTask.isDefined());
			});
		});

		it("Should be able to release multiple claimed tasks.", () => {
			const repository = new LongTaskRepositoryArray;

			return Promise.resolve().then(() => {
				return Promise.all([
					repository.add("great-job", "{teacherId: 9, classroomId:4}", new UserId("93"), "happy"),
					repository.add("nice-job", "{teacherId: 2, classroomId:8}", new UserId("12"), "cool"),
					repository.add("sweet-job", "{teacherId: 3, classroomId:2}", new UserId("32"), "3"),
					repository.add("ok-job", "{teacherId: 7, classroomId:9}", new UserId("55"), "test"),
				]);
			}).then((values: Array <LongTaskId>) => {
				const taskIds = [
					values[1], 
					values[2]
				];

				return Promise.all([
					repository.claim(values[0], LongTaskClaim.withNowTimestamp()),
					repository.claim(values[1], LongTaskClaim.withNowTimestamp()),
					repository.claim(values[2], LongTaskClaim.withNowTimestamp()),
					repository.release(taskIds),
				]);
			}).then((values: Array <boolean>) => {
				return repository.getNextTask();
			}).then((nextTask: Option <LongTask>) => {
				assert.isTrue(nextTask.isDefined());

				if (nextTask.isDefined()) {
					assert.equal(nextTask.get().attributes.type, "nice-job");
				}
			});
		});
	});

	describe("Update", () => {
		it("Should not allow status change from queued to processing, failed, or completed.", () => {
			const repository = new LongTaskRepositoryArray;

			return Promise.resolve().then(() => {
				return repository.add("fun-job", "{teacher:2, students:[1,2,3,4,5]}", new UserId("6"), "9");
			}).then((taskId: LongTaskId) => {
				const progress = LongTaskProgress.none();
				const status = LongTaskStatus.Processing;
				return repository.update(taskId, progress, status);
			}).catch((error) => {
				assert.isNotNull(error);
			});
		});

		it("Should update the progress of a task.", () => {
			const repository = new LongTaskRepositoryArray;

			return Promise.resolve().then(() => {
				return repository.add("fun-job", "{teacher:2, students:[1,2,3,4,5]}", new UserId("6"), "9");
			}).then((taskId: LongTaskId) => {
				const status = LongTaskStatus.Processing;
				const progress = LongTaskProgress.withStateCurrentStepAndMaximumSteps("{successful-student-ids:[1,2],failed-student-ids:[3], failure-message:['Missing student.']}", 4, 5);

				return Promise.all([
					repository.claim(taskId, LongTaskClaim.withNowTimestamp()),
					repository.update(taskId, progress, status),
				]);
			}).then((values: Array <boolean>) => {
				assert.isTrue(values[1]);
			});
		});
	});
	
	describe("Cancel", () => {
		it("Should cancel the specified task.", () => {
			const repository = new LongTaskRepositoryArray;

			return Promise.resolve().then(() => {
				return repository.add("great-job", "{teacherId:3, classroomId:9}", new UserId("11"), "9");
			}).then((taskId: LongTaskId) => {
				return repository.cancel(taskId);
			}).then(() => {
				return repository.getNextTask();
			}).then((nextTask: Option <LongTask>) => {
				assert.isFalse(nextTask.isDefined());
			});
		});

		it("Should throw an error if the specified task is already cancelled.", () => {
			const repository = new LongTaskRepositoryArray;

			return Promise.resolve().then(() => {
				return repository.add("great-job", "{teacherId:3, classroomId:9}", new UserId("11"), "9");
			}).then((taskId: LongTaskId) => {
				return Promise.all([
					repository.cancel(taskId),
					repository.cancel(taskId),
				]);
			}).catch((error) => {
				assert.isNotNull(error);
			});
		});
	});

	describe("Delete a task", () => {
		it("Should delete a task from the table.", () => {
			const repository = new LongTaskRepositoryArray;

			return Promise.all([
				repository.add("great-job", "{teacherId:3, classroomId: 9}", new UserId("2"), "9"),
				repository.add("fabulous-job", "{students:[3,2,1], classroomId: 10}", new UserId("1"), "3"),
				repository.add("awesome-job", "{students:[1,2,3,4], reportId: 1}", new UserId("4"), "1"),
			]).then((taskIds: Array <LongTaskId>) => {
				return repository.delete(taskIds[0]);
			}).then(() => {
				return repository.getNextTask();
			}).then((task: Option <LongTask>) => {
				assert.isTrue(task.isDefined());

				if (task.isDefined()) {
					assert.equal("fabulous-job", task.get().attributes.type);
				}
			});
		});

		it("Should throw an error when trying to delete a task that doesn't exist in the table.", () => {
			const repository = new LongTaskRepositoryArray;

			return Promise.all([
				repository.add("great-job", "{teacherId:3, classroomId: 9}", new UserId("2"), "9"),
				repository.add("fabulous-job", "{students:[3,2,1], classroomId: 10}", new UserId("1"), "3"),
				repository.add("awesome-job", "{students:[1,2,3,4], reportId: 1}", new UserId("4"), "1"),
			]).then((taskIds: Array <LongTaskId>) => {
				return Promise.all([
					repository.delete(taskIds[0]),
					repository.delete(taskIds[0]),
				]);
			}).catch((error) => {
				assert.isNotNull(error);
			});
		});
	});
	
	describe("Tasks with Search Key", () => {
		it("Should return an empty array when no tasks have the specified search key.", () => {
			const repository = new LongTaskRepositoryArray;

			return Promise.all([
				repository.add("great-job", "{teacherId:3, classroomId: 9}", new UserId("2"), "9"),
				repository.add("fabulous-job", "{students:[3,2,1], classroomId: 10}", new UserId("1"), "3"),
				repository.add("awesome-job", "{students:[1,2,3,4], reportId: 1}", new UserId("4"), "1"),
				repository.add("sweet-job", "{students:[9,10], teacher: 7}", new UserId("6"), "10"),
			]).then(() => {
				return repository.getTasksForSearchKey("hello");
			}).then((tasks: Array <LongTask>) => {
				assert.lengthOf(tasks, 0);
			});
		});

		it("Should return an array of tasks when tasks have the specified search key.", () => {
			const repository = new LongTaskRepositoryArray;
			const key = "hello";

			return Promise.all([
				repository.add("great-job", "{teacherId:3, classroomId: 9}", new UserId("2"), key),
				repository.add("fabulous-job", "{students:[3,2,1], classroomId: 10}", new UserId("1"), "3"),
				repository.add("awesome-job", "{students:[1,2,3,4], reportId: 1}", new UserId("4"), key),
				repository.add("sweet-job", "{students:[9,10], teacher: 7}", new UserId("6"), "10"),
			]).then(() => {
				return repository.getTasksForSearchKey(key);
			}).then((tasks: Array <LongTask>) => {
				assert.lengthOf(tasks, 2);
			});
		});
	});

	describe("Tasks with UserId", () => {
		it("Should return an empty array when no tasks were created with the specified user id.", () => {
			const repository = new LongTaskRepositoryArray;

			return Promise.all([
				repository.add("great-job", "{teacherId:3, classroomId: 9}", new UserId("2"), "9"),
				repository.add("fabulous-job", "{students:[3,2,1], classroomId: 10}", new UserId("1"), "3"),
				repository.add("awesome-job", "{students:[1,2,3,4], reportId: 1}", new UserId("4"), "1"),
				repository.add("sweet-job", "{students:[9,10], teacher: 7}", new UserId("6"), "10"),
			]).then(() => {
				return repository.getTasksForUserId(new UserId("456"));
			}).then((tasks: Array <LongTask>) => {
				assert.lengthOf(tasks, 0);
			});
		});

		it("Should return an array of tasks when, one or more, tasks were created by the specified user id.", () => {
			const repository = new LongTaskRepositoryArray;
			const userId = new UserId("456");

			return Promise.all([
				repository.add("great-job", "{teacherId:3, classroomId: 9}", new UserId("2"), "9"),
				repository.add("fabulous-job", "{students:[3,2,1], classroomId: 10}", userId, "3"),
				repository.add("awesome-job", "{students:[1,2,3,4], reportId: 1}", new UserId("4"), "1"),
				repository.add("sweet-job", "{students:[9,10], teacher: 7}", userId, "10"),
			]).then(() => {
				return repository.getTasksForUserId(userId);
			}).then((tasks: Array <LongTask>) => {
				assert.lengthOf(tasks, 2);
			});
		});
	});

	describe("Tasks older than duration", () => {
		it("Should retrieve processing tasks that have a expired.", () => {
			// create a bunch of tasks... with varying times.
			// no way to do this with ARRAY... FS?

			assert.isTrue(false);
		});
	});
});