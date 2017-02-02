import {Logger} from "./Logger";

export class ConsoleLogger implements Logger {
	public info(message: string): void {
		console.log("[INFO] " + message);
	}

	public debug(message: string): void {
		conole.log("[DEBUG] " + message);
	}

	public trace(message: string): void {
		console.log("[TRACE] " + message);
	}

	public error(message: string): void {
		console.log("[ERROR] " + message);
	}

	public fatal(message: string): void {
		console.log("[FATAL] " + message);
	}

	public warn(message: string): void {
		console.log("[WARN] " + message);
	}
}
