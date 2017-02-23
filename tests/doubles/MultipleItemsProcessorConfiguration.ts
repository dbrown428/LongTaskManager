import {LongTaskType} from "../../src/Domain/LongTaskType";
import {MultipleItemsProcessor} from "./MultipleItemsProcessor";
import {LongTaskProcessor} from "../../src/Domain/LongTaskProcessor";
import {LongTaskProcessorConfiguration} from "../../src/Domain/LongTaskProcessorConfiguration";

export class MultipleItemsProcessorConfiguration implements LongTaskProcessorConfiguration {
    public key(): LongTaskType {
        return LongTaskType.withValue("do-many-things");
    }

    public default(): LongTaskProcessor {
        return new MultipleItemsProcessor;
    }
}
