/// <reference types="node" />
import { IChat, IUser } from "rompot-base";
import ClientModule from "../../client/models/ClientModule";
export default class User extends ClientModule implements IUser {
    name: string;
    id: string;
    constructor(id: string, name?: string);
    blockUser(): Promise<void>;
    unblockUser(): Promise<void>;
    getName(): Promise<string>;
    setName(name: string): Promise<void>;
    getDescription(): Promise<string>;
    setDescription(description: string): Promise<void>;
    getProfile(): Promise<Buffer>;
    setProfile(image: Buffer): Promise<void>;
    isAdmin(chat: IChat | string): Promise<boolean>;
    isLeader(chat: IChat | string): Promise<boolean>;
}
