import CommandConfig from "./CommandConfig";
export interface ConnectionConfig {
    commandConfig: CommandConfig;
    disableAutoCommand?: boolean;
    disableAutoTyping?: boolean;
    disableAutoRead?: boolean;
}
export declare const DefaultConnectionConfig: {
    commandConfig: CommandConfig;
    disableAutoCommand: boolean;
    disableAutoTyping: boolean;
    disableAutoRead: boolean;
};
