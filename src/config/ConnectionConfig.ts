import CommandConfig, { DefaultCommandConfig } from "@config/CommandConfig";

export interface ConnectionConfig {
  commandConfig: CommandConfig;
  disableAutoCommand: boolean;
  disableAutoTyping: boolean;
  disableAutoRead: boolean;
  maxReconnectTimes: number;
  reconnectTimeout: number;
}

export const DefaultConnectionConfig: ConnectionConfig = {
  commandConfig: DefaultCommandConfig,
  disableAutoCommand: false,
  disableAutoTyping: false,
  disableAutoRead: false,
  maxReconnectTimes: 12,
  reconnectTimeout: 1000,
};
