export class Option <T> {
	private value: T | null;

	public static some(value: any): Option <any> {
		return new Option(value);
	}

	private constructor(value: T | null) {
		this.value = value;
	}

	public static none(): Option <any> {
		return new Option(null);
	}

	public isDefined(): boolean {
		const isSet: boolean = (typeof this.value !== 'undefined');
		const hasValue: boolean = (this.value !== null);

		return isSet && hasValue;
	}

	public isEmpty(): boolean {
		return ( ! this.isDefined());
	}

	public getOrElse(value: T): any {
		if (this.isDefined()) {
			return this.value;
		} else {
			return value;
		}
	}

	public get(): T | null {
		return this.value;
	}
}
