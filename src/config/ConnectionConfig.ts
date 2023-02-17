import CommandConfig, { DefaultCommandConfig } from "@config/CommandConfig";

export interface ConnectionConfig {
  commandConfig: CommandConfig;
  receiveAllMessages?: boolean;
  disableAutoCommand?: boolean;
  printQRInTerminal?: boolean;
  disableAutoTyping?: boolean;
  disableAutoRead?: boolean;
}

export const DefaultConnectionConfig = {
  commandConfig: DefaultCommandConfig,
  receiveAllMessages: false,
  printQRInTerminal: true,
  disableAutoCommand: false,
  disableAutoTyping: false,
  disableAutoRead: false,
};
