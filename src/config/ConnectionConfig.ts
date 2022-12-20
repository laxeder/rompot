import { LoggerOptions } from "pino";
import PinoPretty from "pino-pretty";

export interface ConnectionConfig {
  logger?: LoggerOptions | PinoPretty.PrettyStream;
  disableAutoCommand?: boolean;
  autoRunBotCommand?: boolean;
  receiveAllMessages?: boolean;
  printQRInTerminal?: boolean;
  disableAutoRead?: boolean;
}
