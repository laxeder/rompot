/// <reference types="node" />
import { SignalDataTypeMap } from "@adiwajshing/baileys";
import Auth from "../interfaces/Auth";
export declare class MultiFileAuthState implements Auth {
    folder: string;
    constructor(folder: string, autoCreateDir?: boolean);
    getStat(folder: string): import("fs").Stats;
    get: (key: string) => Promise<string>;
    set: (key: string, data: any) => Promise<void>;
    writeData: (data: any, file: string) => Promise<void>;
    readData: (file: string) => string;
    removeData: (file: string) => Promise<void>;
    fixFileName: (file?: string) => string;
}
export declare function getBaileysAuth(auth: Auth): Promise<{
    saveCreds: () => Promise<void>;
    state: {
        creds: any;
        keys: {
            get: (type: keyof SignalDataTypeMap, ids: string[]) => Promise<{
                [_: string]: any;
            }>;
            set: (data: any) => Promise<void>;
        };
    };
}>;
