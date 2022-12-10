import { LoggerOptions } from "pino";
import PinoPretty from "pino-pretty";
export interface BuildConfig {
    logger?: LoggerOptions | PinoPretty.PrettyStream;
    disableAutoCommand?: boolean;
    printQRInTerminal?: boolean;
    disableAutoRead?: boolean;
}
