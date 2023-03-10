import CommandConfig from "./CommandConfig";
export interface ConnectionConfig {
    commandConfig: CommandConfig;
    disableAutoCommand?: boolean;
    printQRInTerminal?: boolean;
    disableAutoTyping?: boolean;
    disableAutoRead?: boolean;
}
export declare const DefaultConnectionConfig: {
    commandConfig: CommandConfig;
    printQRInTerminal: boolean;
    disableAutoCommand: boolean;
    disableAutoTyping: boolean;
    disableAutoRead: boolean;
};
