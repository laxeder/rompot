import CommandConfig, { DefaultCommandConfig } from "@config/CommandConfig";
import Auth from "@interfaces/Auth";

export interface ConnectionConfig {
  commandConfig?: CommandConfig;
  receiveAllMessages?: boolean;
  disableAutoCommand?: boolean;
  printQRInTerminal?: boolean;
  disableAutoTyping?: boolean;
  disableAutoRead?: boolean;
  auth: Auth | string;
}

export const DefaultConnectionConfig = {
  commandConfig: DefaultCommandConfig,
  receiveAllMessages: false,
  printQRInTerminal: true,
  disableAutoCommand: false,
  disableAutoTyping: false,
  disableAutoRead: false,
  auth: "./session",
};
