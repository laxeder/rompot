import { LoggerOptions } from "pino";
import pretty from "pino-pretty";
export declare const defaultConfig: pretty.PrettyStream;
export declare const loggerConfig: (options?: LoggerOptions | pretty.PrettyStream) => import("pino").Logger<LoggerOptions | pretty.PrettyStream>;
export declare const logger: import("pino").Logger<pretty.PrettyStream>;
