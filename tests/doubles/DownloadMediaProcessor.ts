import * as HttpClient from "http";
import {LongTask} from "../../src/Domain/LongTask";
import {LongTaskManager} from "../../src/Domain/LongTaskManager";
import {DownloadMediaParameters} from "./DownloadMediaParameters";
import {LongTaskProcessor} from "../../src/Domain/LongTaskProcessor";

export class DownloadMediaProcessor implements LongTaskProcessor {
	
	// private var... todo
	// constructor(repository : LongTaskReadRepository, httpClient: HttpClient) {}

	execute(task: LongTask, manager: LongTaskManager) {
		console.log("Downloading...");

		// Does it make sense to check the status, or just optimistically blaze forward...?
		// > Has it been cancelled, or deleted?
		// - manager.getTaskWithId? or LongTaskReadRepository.taskWithId
		// if yes, then stop processing, and cleanup.

		const jsonParams = task.params();
		const stepsPerItem = 2;	// arbitrary value for demonstration purposes.
		const params = DownloadMediaParameters.withJSON(jsonParams);
		const maximumSteps = params.items.length * stepsPerItem;
		var currentStep = 0;

		// Download each item twice... just for demo reasons.

		// Hidden dependency here...

	    const request = HttpClient.get(task, function(response) {
	        // if response is X, then error... done(error)
	        // Blocking...
	        // return done();
	    });

	    // manager.updateProgress...
	    // - if this throws an exception, then it's possibly the status changed 
	    // on us, and we didn't the update. Die.
	}
}
