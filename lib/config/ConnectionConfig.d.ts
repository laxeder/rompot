import CommandConfig from "./CommandConfig";
export interface ConnectionConfig {
    commandConfig: CommandConfig;
    disableAutoCommand: boolean;
    disableAutoTyping: boolean;
    disableAutoRead: boolean;
    maxReconnectTimes: number;
    reconnectTimeout: number;
}
export declare const DefaultConnectionConfig: ConnectionConfig;
