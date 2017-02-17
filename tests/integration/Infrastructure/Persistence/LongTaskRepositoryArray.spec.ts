import {assert} from "chai";
import {Promise} from "es6-promise";	// use Bluebird promise... add .done() to promises. TODO
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

describe("Long task repository array implementation", () => {
	describe("Add Task", () => {
		it("Should add task attributes to the list.", () => {
			const validator = new LongTaskStatusChangeValidator;
			const repository = new LongTaskRepositoryArray(validator);
			const type = new LongTaskType("awesome-job");
			const ownerId = new UserId("4");
			const searchKey = "8";
			const params = LongTaskParametersDummy.withJson("{students:[1,2,3,4], reportId:5}");

			return repository.add(type, params, ownerId, searchKey)
				.then((taskId: LongTaskId) => {
					return repository.getNextTask();
				})
				.then((nextTask: Option <LongTask>) => {
					assert.isTrue(nextTask.isDefined());
				});
		});
	});

	describe("Get Task with ID", () => {
		it("should return an empty option if the taskId does not exist", () => {
			const validator = new LongTaskStatusChangeValidator;
			const repository = new LongTaskRepositoryArray(validator);
			const taskId = new LongTaskId("435");

			return repository.getTaskWithId(taskId)
				.then((taskOption: Option <LongTask>) => {
					assert.isTrue(taskOption.isEmpty());
				});
		});

		it("should return the specified task.", () => {
			const validator = new LongTaskStatusChangeValidator;
			const repository = new LongTaskRepositoryArray(validator);
			const taskType = new LongTaskType("sweet-task");
			const params = LongTaskParametersDummy.withJson("{students:[1,2,3,4]}");

			return repository.add(taskType, params, new UserId("4"), "happy")
				.then((taskId: LongTaskId) => {
					return repository.getTaskWithId(taskId);
				})
				.then((taskOption: Option <LongTask>) => {
					const task = taskOption.get();
					assert.equal(task.type(), taskType.type);
				});
		});
	});

	describe("Next Task", () => {
		it("Should return an empty option when there is no next task.", () => {
			const validator = new LongTaskStatusChangeValidator;
			const repository = new LongTaskRepositoryArray(validator);

			return repository.getNextTask()
				.then((nextTask: Option <LongTask>) => {
					assert.isTrue(nextTask.isEmpty());
				});
		});

		it("Should return the first of many queued tasks.", () => {
			const validator = new LongTaskStatusChangeValidator;
			const repository = new LongTaskRepositoryArray(validator);
			const ownerId = new UserId("6");

			return Promise.all([
					repository.add(new LongTaskType("great-job"), LongTaskParametersDummy.withJson("{teacherId:3, classroomId: 9}"), ownerId, "9"),
					repository.add(new LongTaskType("fabulous-job"), LongTaskParametersDummy.withJson("{students:[3,2,1], classroomId: 10}"), ownerId, "1"),
					repository.add(new LongTaskType("awesome-job"), LongTaskParametersDummy.withJson("{students:[1,2,3,4], reportId: 1}"), ownerId, "2"),
				])
				.then((values: Array <LongTaskId>) => {
					return repository.getNextTask();
				})
				.then((nextTask: Option <LongTask>) => {
					assert.isTrue(nextTask.isDefined());

					if(nextTask.isDefined()) {
						assert.equal("great-job", nextTask.get().type());
					}
				});
		});

		it("Should return the first queued task.", () => {
			const validator = new LongTaskStatusChangeValidator;
			const repository = new LongTaskRepositoryArray(validator);

			return Promise.all([
					repository.add(new LongTaskType("great-job"), LongTaskParametersDummy.withJson("{teacherId:3, classroomId: 9}"), new UserId("2"), "9"),
					repository.add(new LongTaskType("fabulous-job"), LongTaskParametersDummy.withJson("{students:[3,2,1], classroomId: 10}"), new UserId("1"), "3"),
					repository.add(new LongTaskType("awesome-job"), LongTaskParametersDummy.withJson("{students:[1,2,3,4], reportId: 1}"), new UserId("4"), "1"),
					repository.add(new LongTaskType("sweet-job"), LongTaskParametersDummy.withJson("{students:[9,10], teacher: 7}"), new UserId("6"), "10"),
				])
				.then((values: Array <LongTaskId>) => {
					return Promise.all([
						repository.claim(values[0], LongTaskClaim.withNowTimestamp()),
						repository.claim(values[1], LongTaskClaim.withNowTimestamp()),
					]);
				})
				.then(() => {
					return repository.getNextTask();
				})
				.then((nextTask: Option <LongTask>) => {
					assert.isTrue(nextTask.isDefined());

					if (nextTask.isDefined()) {
						assert.equal("awesome-job", nextTask.get().type());
					}
				});
		});
	});

	describe("Claim a Task", () => {
		it("Should be able to claim an unclaimed task.", () => {
			const validator = new LongTaskStatusChangeValidator;
			const repository = new LongTaskRepositoryArray(validator);

			return repository.add(new LongTaskType("great-job"), LongTaskParametersDummy.withJson("{teacherId:3, classroomId:9}"), new UserId("5"), "3")
				.then((taskId: LongTaskId) => {
					const claimId = LongTaskClaim.withNowTimestamp();

					return Promise.all([
							repository.claim(taskId, claimId),
							repository.getTaskWithId(taskId),
						]);
				})
				.then((values: Array <any>) => {
					const task = values[1];
					assert.isTrue(task.get().isClaimed());
				});
		});

		it("Should not be able to claim an already claimed task.", () => {
			const validator = new LongTaskStatusChangeValidator;
			const repository = new LongTaskRepositoryArray(validator);

			return repository.add(new LongTaskType("great-job"), LongTaskParametersDummy.withJson("{teacherId:3, classroomId:9}"), new UserId("11"), "9")
				.then((taskId: LongTaskId) => {
					return Promise.all([
						repository.claim(taskId, LongTaskClaim.withNowTimestamp()),
						repository.claim(taskId, LongTaskClaim.withNowTimestamp()),
					]);
				})
				.catch((error) => {
					assert.isNotNull(error);
				});
		});

		it("Should be able to release a claimed task.", () => {
			const validator = new LongTaskStatusChangeValidator;
			const repository = new LongTaskRepositoryArray(validator);

			return repository.add(new LongTaskType("sweet-job"), LongTaskParametersDummy.withJson("{teacherId: 2, classroomId:8}"), new UserId("3"), "happy")
				.then((taskId: LongTaskId) => {
					return Promise.all([
						repository.claim(taskId, LongTaskClaim.withNowTimestamp()),
						repository.release(taskId),
						repository.getTaskWithId(taskId),
					]);
				})
				.then((values: Array <any>) => {
					const taskOption = values[2];
					assert.isFalse(taskOption.get().isClaimed());
				});
		});
	});

	describe("Update Task", () => {
		it("Should update the progress of a task.", () => {
			const validator = new LongTaskStatusChangeValidator;
			const repository = new LongTaskRepositoryArray(validator);
			const status = LongTaskStatus.Processing;
			const progress = LongTaskProgress.withStateCurrentStepAndMaximumSteps("{successful-student-ids:[1,2],failed-student-ids:[3], failure-message:['Missing student.']}", 4, 5);

			return repository.add(new LongTaskType("fun-job"), LongTaskParametersDummy.withJson("{teacher:2, students:[1,2,3,4,5]}"), new UserId("6"), "9")
				.then((taskId: LongTaskId) => {
					return Promise.all([
						repository.claim(taskId, LongTaskClaim.withNowTimestamp()),
						repository.update(taskId, progress, status),
						repository.getTaskWithId(taskId),
					]);
				})
				.then((values: Array <any>) => {
					const taskOption = values[2];
					assert.isTrue(taskOption.isDefined());
					assert.equal(taskOption.get().progressCurrentStep(), 4);
					assert.equal(taskOption.get().progressMaximumSteps(), 5);
				})
				.catch((error) => {
					assert.isNull(error);
				});
		});
	});
	
	describe("Cancel Task", () => {
		it("Should cancel a task.", () => {
			const validator = new LongTaskStatusChangeValidator;
			const repository = new LongTaskRepositoryArray(validator);
			const userId = new UserId("11");

			return repository.add(new LongTaskType("great-job"), LongTaskParametersDummy.withJson("{teacherId:3, classroomId:9}"), userId, "9")
				.then((taskId: LongTaskId) => {
					return Promise.all([
						repository.cancel(taskId),
						repository.getTasksForUserId(userId),
					]);
				})
				.then((values: Array <any>) => {
					const task: LongTask = values[1][0];
					assert.isTrue(task.isCancelled());
				});
		});
	});

	describe("Delete task", () => {
		it("Should delete a task regardless of it's status.", () => {
			const validator = new LongTaskStatusChangeValidator;
			const repository = new LongTaskRepositoryArray(validator);

			return Promise.all([
				repository.add(new LongTaskType("great-job"), LongTaskParametersDummy.withJson("{teacherId:3, classroomId: 9}"), new UserId("2"), "9"),
				repository.add(new LongTaskType("fabulous-job"), LongTaskParametersDummy.withJson("{students:[3,2,1], classroomId: 10}"), new UserId("1"), "3"),
				repository.add(new LongTaskType("awesome-job"), LongTaskParametersDummy.withJson("{students:[1,2,3,4], reportId: 1}"), new UserId("4"), "1"),
			])
			.then((taskIds: Array <LongTaskId>) => {
				return repository.delete(taskIds[0]);
			})
			.then(() => {
				return repository.getNextTask();
			})
			.then((task: Option <LongTask>) => {
				assert.isTrue(task.isDefined());

				if (task.isDefined()) {
					assert.equal("fabulous-job", task.get().type());
				}
			});
		});

		it("Should result in an error when trying to delete a task that doesn't exist.", () => {
			const validator = new LongTaskStatusChangeValidator;
			const repository = new LongTaskRepositoryArray(validator);

			return Promise.all([
				repository.add(new LongTaskType("great-job"), LongTaskParametersDummy.withJson("{teacherId:3, classroomId: 9}"), new UserId("2"), "9"),
				repository.add(new LongTaskType("fabulous-job"), LongTaskParametersDummy.withJson("{students:[3,2,1], classroomId: 10}"), new UserId("1"), "3"),
				repository.add(new LongTaskType("awesome-job"), LongTaskParametersDummy.withJson("{students:[1,2,3,4], reportId: 1}"), new UserId("4"), "1"),
			])
			.then((taskIds: Array <LongTaskId>) => {
				return Promise.all([
					repository.delete(taskIds[0]),
					repository.delete(taskIds[0]),
				]);
			})
			.catch((error) => {
				assert.isNotNull(error);
			});
		});
	});
	
	describe("Tasks with Search Key", () => {
		it("Should return an empty array when no tasks have the specified search key.", () => {
			const validator = new LongTaskStatusChangeValidator;
			const repository = new LongTaskRepositoryArray(validator);

			return Promise.all([
				repository.add(new LongTaskType("great-job"), LongTaskParametersDummy.withJson("{teacherId:3, classroomId: 9}"), new UserId("2"), "9"),
				repository.add(new LongTaskType("fabulous-job"), LongTaskParametersDummy.withJson("{students:[3,2,1], classroomId: 10}"), new UserId("1"), "3"),
				repository.add(new LongTaskType("awesome-job"), LongTaskParametersDummy.withJson("{students:[1,2,3,4], reportId: 1}"), new UserId("4"), "1"),
				repository.add(new LongTaskType("sweet-job"), LongTaskParametersDummy.withJson("{students:[9,10], teacher: 7}"), new UserId("6"), "10"),
			])
			.then((values: Array <LongTaskId>) => {
				return repository.getTasksForSearchKey("hello");
			})
			.then((tasks: Array <LongTask>) => {
				assert.lengthOf(tasks, 0);
			});
		});

		it("Should return an array of tasks when tasks have the specified search key.", () => {
			const validator = new LongTaskStatusChangeValidator;
			const repository = new LongTaskRepositoryArray(validator);
			const key = "hello";

			return Promise.all([
				repository.add(new LongTaskType("great-job"), LongTaskParametersDummy.withJson("{teacherId:3, classroomId: 9}"), new UserId("2"), key),
				repository.add(new LongTaskType("fabulous-job"), LongTaskParametersDummy.withJson("{students:[3,2,1], classroomId: 10}"), new UserId("1"), "3"),
				repository.add(new LongTaskType("awesome-job"), LongTaskParametersDummy.withJson("{students:[1,2,3,4], reportId: 1}"), new UserId("4"), key),
				repository.add(new LongTaskType("sweet-job"), LongTaskParametersDummy.withJson("{students:[9,10], teacher: 7}"), new UserId("6"), ["10", key]),
			])
			.then((values: Array <LongTaskId>) => {
				return repository.getTasksForSearchKey(key);
			})
			.then((tasks: Array <LongTask>) => {
				assert.lengthOf(tasks, 3);
			});
		});
	});

	describe("Tasks with UserId", () => {
		it("Should return an empty array when no tasks were created with the specified user id.", () => {
			const validator = new LongTaskStatusChangeValidator;
			const repository = new LongTaskRepositoryArray(validator);

			return Promise.all([
				repository.add(new LongTaskType("great-job"), LongTaskParametersDummy.withJson("{teacherId:3, classroomId: 9}"), new UserId("2"), "9"),
				repository.add(new LongTaskType("fabulous-job"), LongTaskParametersDummy.withJson("{students:[3,2,1], classroomId: 10}"), new UserId("1"), "3"),
				repository.add(new LongTaskType("awesome-job"), LongTaskParametersDummy.withJson("{students:[1,2,3,4], reportId: 1}"), new UserId("4"), "1"),
				repository.add(new LongTaskType("sweet-job"), LongTaskParametersDummy.withJson("{students:[9,10], teacher: 7}"), new UserId("6"), "10"),
			])
			.then((values: Array <LongTaskId>) => {
				return repository.getTasksForUserId(new UserId("456"));
			})
			.then((tasks: Array <LongTask>) => {
				assert.lengthOf(tasks, 0);
			});
		});

		it("Should return an array of tasks when, one or more, tasks were created by the specified user id.", () => {
			const userId = new UserId("456");
			const validator = new LongTaskStatusChangeValidator;
			const repository = new LongTaskRepositoryArray(validator);

			return Promise.all([
				repository.add(new LongTaskType("great-job"), LongTaskParametersDummy.withJson("{teacherId:3, classroomId: 9}"), new UserId("2"), "9"),
				repository.add(new LongTaskType("fabulous-job"), LongTaskParametersDummy.withJson("{students:[3,2,1], classroomId: 10}"), userId, "3"),
				repository.add(new LongTaskType("awesome-job"), LongTaskParametersDummy.withJson("{students:[1,2,3,4], reportId: 1}"), new UserId("4"), "1"),
				repository.add(new LongTaskType("sweet-job"), LongTaskParametersDummy.withJson("{students:[9,10], teacher: 7}"), userId, "10"),
			])
			.then((values: Array <LongTaskId>) => {
				return repository.getTasksForUserId(userId);
			})
			.then((tasks: Array <LongTask>) => {
				assert.lengthOf(tasks, 2);
			});
		});
	});

	describe("Tasks older than duration", () => {
		it("should retrieve processing tasks that have a expired.", () => {
			const userId = new UserId("456");
			const validator = new LongTaskStatusChangeValidator;
			const repository = new LongTaskRepositoryArray(validator);

			return Promise.all([
					repository.add(new LongTaskType("great-job"), LongTaskParametersDummy.withJson("{teacherId:3, classroomId: 9}"), new UserId("2"), "9"),
					repository.add(new LongTaskType("fabulous-job"), LongTaskParametersDummy.withJson("{students:[3,2,1], classroomId: 10}"), userId, "3"),
					repository.add(new LongTaskType("awesome-job"), LongTaskParametersDummy.withJson("{students:[1,2,3,4], reportId: 1}"), new UserId("4"), "1"),
					repository.add(new LongTaskType("sweet-job"), LongTaskParametersDummy.withJson("{students:[9,10], teacher: 7}"), userId, "10"),
				])
				.then((taskIds: Array <LongTaskId>) => {
					const date = new Date();
					const oldDate = Date.now() - 4000;
					const duration = Duration.withSeconds(2);

					return Promise.all([
						repository.claim(taskIds[0], LongTaskClaim.withNowTimestamp()),
						repository.claim(taskIds[1], LongTaskClaim.withExistingTimestamp(oldDate)),
						repository.claim(taskIds[2], LongTaskClaim.withNowTimestamp()),
						repository.getProcessingTasksWithClaimOlderThanDurationFromDate(duration, date),
					]);
				})
				.then((values: Array <any>) => {
					const tasks = values[3];
					assert.lengthOf(tasks, 1);
					assert.equal(tasks[0].type(), "fabulous-job");
				});
		});
	});
});
