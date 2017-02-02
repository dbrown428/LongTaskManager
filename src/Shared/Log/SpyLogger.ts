import {Logger} from "./Logger";

export class SpyLogger implements Logger {
	private infoCallCount: number;
	private debugCallCount: number;
	private traceCallCount: number;
	private errorCallCount: number;
	private fatalCallCount: number;
	private warnCallCount: number;

	constructor() {
		this.infoCallCount = 0;
		this.debugCallCount = 0;
		this.traceCallCount = 0;
		this.errorCallCount = 0;
		this.fatalCallCount = 0;
		this.warnCallCount = 0;
	}

	public info(message: string): void {
		this.infoCallCount += 1;
	}

	public infoCount(): number {
		return this.infoCallCount;
	}

	public debug(message: string): void {
		this.debugCallCount += 1;
	}

	public debugCount(): number {
		return this.debugCallCount;
	}

	public trace(message: string): void {
		this.traceCallCount += 1;
	}

	public traceCount(): number {
		return this.traceCallCount;
	}

	public error(message: string): void {
		this.errorCallCount += 1;
	}

	public errorCount(): number {
		return this.errorCallCount;
	}

	public fatal(message: string): void {
		this.fatalCallCount += 1;
	}

	public fatalCount(): number {
		return this.fatalCallCount;
	}

	public warn(message: string): void {
		this.warnCallCount += 1;
	}

	public warnCount(): number {
		return this.warnCallCount;
	}
}
