import {LongTaskType} from "../../src/Domain/LongTaskType";
import {MultipleItemsProcessor} from "./MultipleItemsProcessor";
import {LongTask} from "../../src/Domain/LongTask";
import {LongTaskConfiguration} from "../../src/Domain/LongTaskConfiguration";

export class MultipleItemsLongTaskConfiguration implements LongTaskConfiguration {
    public key(): LongTaskType {
        return LongTaskType.withValue("do-many-things");
    }

    public default(): LongTask {
        return new MultipleItemsLongTask;
    }
}
