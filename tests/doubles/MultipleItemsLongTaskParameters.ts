import {LongTaskParameters} from "../../src/Domain/LongTaskParameters";

export class MultipleItemsLongTaskParameters implements LongTaskParameters {
    public static withSampleItems(items: Array <number>): MultipleItemsLongTaskParameters {
        return new MultipleItemsLongTaskParameters(items);
    }

    private constructor(readonly items: Array <number>) {}

    public toJson(): string {
        const serializedItems = JSON.stringify(this.items);
        const json = '{"items":' + serializedItems + '}';
        return json;
    }

    public static withJson(json: string): MultipleItemsLongTaskParameters {
        const params = JSON.parse(json);

        if (params.hasOwnProperty("items")) {
            return new MultipleItemsLongTaskParameters(params.items);
        } else {
            throw Error("The following JSON is invalid for the MultipleItemsLongTaskParameters. It is missing the 'items' property. Make sure you create parameters using implementations of LongTaskParameters:" + json);
        }
    }
}
