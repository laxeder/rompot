import pino, { LoggerOptions } from "pino";
import pretty from "pino-pretty";

export const defaultConfig = pretty({
  ignore: "pid,hostname",
  translateTime: true,
  levelFirst: true,
  colorize: true,
});

export const loggerConfig = (options: LoggerOptions | pretty.PrettyStream = defaultConfig) => pino(options);

export const logger = pino(defaultConfig);
