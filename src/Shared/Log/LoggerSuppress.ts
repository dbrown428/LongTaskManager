import {Logger} from "./Logger";

export class LoggerSuppress implements Logger {
	public info(message: string): void {}
	public debug(message: string): void {}
	public trace(message: string): void {}
	public error(message: string): void {}
	public fatal(message: string): void {}
	public warn(message: string): void {}
}
