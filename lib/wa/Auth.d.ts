/// <reference types="node" />
import { SignalDataTypeMap } from "@adiwajshing/baileys";
import IAuth from "../interfaces/IAuth";
export declare class MultiFileAuthState implements IAuth {
    folder: string;
    constructor(folder: string, autoCreateDir?: boolean);
    fixFileName: (file?: string) => string;
    getStat(folder: string): import("fs").Stats;
    get: (key: string) => Promise<any>;
    set: (key: string, data: any) => Promise<void>;
    writeData: (data: any, file: string) => Promise<void>;
    readData: (file: string) => Promise<any>;
    removeData: (file: string) => Promise<void>;
}
export declare function getBaileysAuth(auth: IAuth): Promise<{
    saveCreds: () => Promise<void>;
    state: {
        creds: any;
        keys: {
            get<T extends keyof SignalDataTypeMap>(type: T, ids: string[]): Promise<{
                [id: string]: SignalDataTypeMap[T];
            }>;
            set: (data: any) => Promise<void>;
        };
    };
}>;
