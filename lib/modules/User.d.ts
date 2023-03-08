/// <reference types="node" />
import { IUser, IUserModule } from "@interfaces/User";
import { IChat } from "@interfaces/Chat";
import { ClientType } from "@modules/Client";
export default class User implements IUser, IUserModule {
    id: string;
    name: string;
    description: string;
    profile: Buffer;
    isAdmin: boolean;
    isLeader: boolean;
    client: ClientType;
    constructor(id: string, name?: string, description?: string, profile?: Buffer);
    blockUser(): Promise<void>;
    unblockUser(): Promise<void>;
    getName(): Promise<string>;
    setName(name: string): Promise<void>;
    getDescription(): Promise<string>;
    setDescription(description: string): Promise<void>;
    getProfile(): Promise<Buffer>;
    setProfile(image: Buffer): Promise<void>;
    IsAdmin(chat: IChat | string): Promise<boolean>;
    IsLeader(chat: IChat | string): Promise<boolean>;
}
