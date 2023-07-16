import { ConnectionConfig } from "rompot-base";

export const ROMPOT_VERSION = "1.6.0";

export const DEFAULT_CONNECTION_CONFIG: ConnectionConfig = {
  disableAutoCommand: false,
  disableAutoTyping: false,
  disableAutoRead: false,
  maxReconnectTimes: 12,
  reconnectTimeout: 1000,
};
