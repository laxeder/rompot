/// <reference types="node" />
import { IChat, IChatModule } from "../interfaces/Chat";
import { IUser } from "../interfaces/User";
import Message from "../messages/Message";
import { ClientType } from "./Client";
import { ChatStatus, ChatType } from "../types/Chat";
import { IUsers, Users } from "../types/User";
export default class Chat implements IChat, IChatModule {
    id: string;
    type: ChatType;
    name: string;
    description: string;
    profile: Buffer;
    status: ChatStatus;
    users: Users;
    client: ClientType;
    constructor(id: string, type?: ChatType, name?: string, description?: string, profile?: Buffer, users?: IUsers, status?: ChatStatus);
    setName(name: string): Promise<void>;
    getName(): Promise<string>;
    getDescription(): Promise<string>;
    setDescription(description: string): Promise<void>;
    getProfile(): Promise<Buffer>;
    setProfile(image: Buffer): Promise<void>;
    IsAdmin(user: IUser | string): Promise<boolean>;
    IsLeader(user: IUser | string): Promise<boolean>;
    getAdmins(): Promise<Users>;
    addUser(user: IUser | string): Promise<void>;
    removeUser(user: IUser | string): Promise<void>;
    promote(user: IUser | string): Promise<void>;
    demote(user: IUser | string): Promise<void>;
    leave(): Promise<void>;
    send(message: Message | string): Promise<Message>;
    changeStatus(status: ChatStatus): Promise<void>;
}
