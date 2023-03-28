import CommandConfig, { DefaultCommandConfig } from "@config/CommandConfig";

export interface ConnectionConfig {
  commandConfig: CommandConfig;
  disableAutoCommand: boolean;
  disableAutoTyping: boolean;
  disableAutoRead: boolean;
}

export const DefaultConnectionConfig = {
  commandConfig: DefaultCommandConfig,
  disableAutoCommand: false,
  disableAutoTyping: false,
  disableAutoRead: false,
};
