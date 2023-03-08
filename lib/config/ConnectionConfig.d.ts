import CommandConfig from "./CommandConfig";
export interface ConnectionConfig {
    commandConfig: CommandConfig;
    receiveAllMessages?: boolean;
    disableAutoCommand?: boolean;
    printQRInTerminal?: boolean;
    disableAutoTyping?: boolean;
    disableAutoRead?: boolean;
}
export declare const DefaultConnectionConfig: {
    commandConfig: CommandConfig;
    receiveAllMessages: boolean;
    printQRInTerminal: boolean;
    disableAutoCommand: boolean;
    disableAutoTyping: boolean;
    disableAutoRead: boolean;
};
