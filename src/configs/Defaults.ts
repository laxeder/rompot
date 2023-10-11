import ConnectionConfig from "@configs/ConnectionConfig";

export const ROMPOT_VERSION = "2.0.0";

export const DEFAULT_CONNECTION_CONFIG: ConnectionConfig = {
  disableAutoCommand: false,
  disableAutoCommandForUnofficialMessage: false,
  disableAutoTyping: false,
  disableAutoRead: false,
  maxReconnectTimes: 12,
  reconnectTimeout: 1000,
};
