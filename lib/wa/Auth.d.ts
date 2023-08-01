/// <reference types="node" />
import { AuthenticationState } from "@whiskeysockets/baileys";
import { IAuth } from "rompot-base";
export declare class MultiFileAuthState implements IAuth {
    folder: string;
    fixFileName: (file?: string) => string;
    getStat(folder: string): import("fs").Stats;
    constructor(folder: string, autoCreateDir?: boolean);
    get(file: string): Promise<any>;
    set(file: string, data: any): Promise<void>;
    remove(file: string): Promise<void>;
    listAll(file?: string): Promise<string[]>;
}
export declare const getBaileysAuth: (auth: IAuth) => Promise<{
    state: AuthenticationState;
    saveCreds: () => Promise<void>;
}>;
