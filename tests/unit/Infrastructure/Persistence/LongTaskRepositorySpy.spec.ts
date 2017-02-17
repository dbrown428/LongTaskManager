import {assert} from "chai";
import {Promise} from "es6-promise";
import {LongTask} from "../../../../src/Domain/LongTask";
import {Option} from "../../../../src/Shared/Values/Option";
import {UserId} from "../../../../src/Shared/Values/UserId";
import {LongTaskId} from "../../../../src/Domain/LongTaskId";
import {LongTaskType} from "../../../../src/Domain/LongTaskType";
import {LongTaskParametersDummy} from "../../../doubles/LongTaskParametersDummy";
import {LongTaskRepositorySpy} from "../../../../src/Infrastructure/Persistence/LongTaskRepositorySpy";

describe("Long Task Repository Spy", () => {
	it("should increment the add call count", () => {
		const repository = new LongTaskRepositorySpy;

		return repository.add(new LongTaskType("awesome-task"), LongTaskParametersDummy.withJson("{students:[1,2,3,4]}"), new UserId("1"), "hello")
			.then((taskId: LongTaskId) => {
				assert.equal(1, repository.addCount());
			});
	});

	it("should increment the getNextTask count", () => {
		const repository = new LongTaskRepositorySpy;

		return repository.getNextTask()
			.then((nextTask: Option <LongTask>) => {
				assert.equal(1, repository.getNextTaskCount());
			});
	});

	// TODO
});
