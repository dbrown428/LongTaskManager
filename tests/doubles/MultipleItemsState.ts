import {LongTaskState} from "../../src/Domain/LongTaskState";

export class MultipleItemsState implements LongTaskState {
    private completed: Array <number>;

    public toJson(): string {
        const json = JSON.stringify(this.completed);
        return '{"completed":' + json + '}';
    }

    public addToCompleted(item: number): void {
        this.completed.push(item);
    }
    
    public processedCount(): number {
        return this.completed.length;
    }

    public static withJson(json: string | null): MultipleItemsState {
        if ( ! json || json.length == 0) {
            return new MultipleItemsState([]);
        }

        const params = JSON.parse(json);

        if (params.hasOwnProperty("completed")) {
            return new MultipleItemsState(params.completed);   
        } else {
            throw Error("The following JSON is invalid for the MultipleItemsState. It is missing the 'completed' attributes: " + json);
        }
    }

    private constructor(completed: Array <number>) {
        this.completed = completed;
    }
}
