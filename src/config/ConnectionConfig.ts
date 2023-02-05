import CommandConfig, { defaultCommandConfig } from "@config/CommandConfig";

export const defaultConfig: ConnectionConfig = {
  commandConfig: defaultCommandConfig,
  receiveAllMessages: false,
  printQRInTerminal: true,
  disableAutoCommand: false,
  disableAutoTyping: false,
  disableAutoRead: false,
};

export default interface ConnectionConfig {
  commandConfig: CommandConfig;
  receiveAllMessages?: boolean;
  disableAutoCommand?: boolean;
  printQRInTerminal?: boolean;
  disableAutoTyping?: boolean;
  disableAutoRead?: boolean;
}
