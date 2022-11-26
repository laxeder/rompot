import pino, { LoggerOptions } from "pino";
import pretty from "pino-pretty";

export const loggerConfig = (options: LoggerOptions) => pino(options);

export const logger = pino(
  pretty({
    ignore: "pid,hostname",
    translateTime: true,
    levelFirst: true,
    colorize: true,
  })
);
