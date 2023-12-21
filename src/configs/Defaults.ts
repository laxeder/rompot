import ConnectionConfig from "./ConnectionConfig";

export const DEFAULT_CONNECTION_CONFIG: ConnectionConfig = {
  disableAutoCommand: false,
  disableAutoCommandForUnofficialMessage: false,
  disableAutoTyping: false,
  disableAutoRead: false,
  maxReconnectTimes: 12,
  reconnectTimeout: 1000,
  maxRequests: 3,
  requestsDelay: 100,
};
