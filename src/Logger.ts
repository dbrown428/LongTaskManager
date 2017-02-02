// Following Apache.log4j logging levels.
export interface Logger {
	info(message: string): void;
	debug(message: string): void;
	trace(message: string): void;
	error(message: string): void;
	fatal(message: string): void;
	warn(message: string): void;
}
