import CommandConfig, { DefaultCommandConfig } from "@config/CommandConfig";

export interface ConnectionConfig {
  commandConfig: CommandConfig;
  disableAutoCommand?: boolean;
  printQRInTerminal?: boolean;
  disableAutoTyping?: boolean;
  disableAutoRead?: boolean;
}

export const DefaultConnectionConfig = {
  commandConfig: DefaultCommandConfig,
  printQRInTerminal: true,
  disableAutoCommand: false,
  disableAutoTyping: false,
  disableAutoRead: false,
};
