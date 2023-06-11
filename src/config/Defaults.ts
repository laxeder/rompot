import { ConnectionConfig } from "@config/ConnectionConfig";

export const ROMPOT_VERSION = "1.5.7";

export const DEFAULT_CONNECTION_CONFIG: ConnectionConfig = {
  disableAutoCommand: false,
  disableAutoTyping: false,
  disableAutoRead: false,
  maxReconnectTimes: 12,
  reconnectTimeout: 1000,
};
