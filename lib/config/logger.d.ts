import { LoggerOptions } from "pino";
import pretty from "pino-pretty";
export declare const loggerConfig: (options: LoggerOptions) => import("pino").Logger<LoggerOptions>;
export declare const logger: import("pino").Logger<pretty.PrettyStream>;
