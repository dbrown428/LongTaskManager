import {LongTaskParameters} from "../../src/Domain/LongTaskParameters";

export class MultipleItemsParameters implements LongTaskParameters {
    public static withSampleItems(items: Array <number>): MultipleItemsParameters {
        return new MultipleItemsParameters(items);
    }

    private constructor(readonly items: Array <number>) {}

    public toJson(): string {
        const serializedItems = JSON.stringify(this.items);
        const json = '{"items":' + serializedItems + '}';
        return json;
    }

    public static withJson(json: string): MultipleItemsParameters {
        const params = JSON.parse(json);

        if (params.hasOwnProperty("items")) {
            return new MultipleItemsParameters(params.items);
        } else {
            throw Error("The following JSON is invalid for the MultipleItemsParameters. It is missing the 'items' property. Make sure you create parameters using implementations of LongTaskParameters:" + json);
        }
    }
}
