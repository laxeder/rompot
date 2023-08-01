/// <reference types="node" />
import { IChat, ChatType, IUser, IMessage, ChatStatus } from "rompot-base";
import { ClientModule } from "../../client";
export default class Chat extends ClientModule implements IChat {
    id: string;
    type: ChatType;
    name: string;
    constructor(id: string, type?: ChatType, name?: string);
    getName(): Promise<string>;
    setName(name: string): Promise<void>;
    getDescription(): Promise<string>;
    setDescription(description: string): Promise<void>;
    getProfile(): Promise<Buffer>;
    setProfile(image: Buffer): Promise<void>;
    isAdmin(user: IUser | string): Promise<boolean>;
    isLeader(user: IUser | string): Promise<boolean>;
    getAdmins(): Promise<Record<string, IUser>>;
    getUsers(): Promise<Record<string, IUser>>;
    addUser(user: IUser | string): Promise<void>;
    removeUser(user: IUser | string): Promise<void>;
    promote(user: IUser | string): Promise<void>;
    demote(user: IUser | string): Promise<void>;
    leave(): Promise<void>;
    send(message: IMessage | string): Promise<IMessage>;
    changeStatus(status: ChatStatus): Promise<void>;
}
