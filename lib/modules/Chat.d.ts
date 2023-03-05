/// <reference types="node" />
import { IMessage } from "@interfaces/Messages";
import IUser from "@interfaces/IUser";
import IChat from "@interfaces/IChat";
import Message from "@messages/Message";
import { ChatStatus, ChatType } from "../types/Chat";
import { Users } from "../types/User";
import { Client } from "../types/Client";
export default class Chat implements IChat {
    id: string;
    type: ChatType;
    status: ChatStatus;
    name: string;
    description: string;
    profile: Buffer;
    users: Users;
    get bot(): Client;
    constructor(id: string, type?: ChatType, name?: string, description?: string, profile?: Buffer, users?: Users, status?: ChatStatus);
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
    send(message: IMessage | string): Promise<Message>;
    changeStatus(status: ChatStatus): Promise<void>;
    /**
     * @param chat Sala de bate-papo que será obtida
     * @returns Retorna a sala de bate-papo
     */
    static getChat<ChatIn extends IChat>(chat: ChatIn | string): ChatIn | IChat;
    /**
     * @param chat Sala de bate-papo
     * @returns Retorna o ID da sala de bate-papo
     */
    static getChatId(chat: IChat | string): string;
    /**
     * * Injeta a interface no modulo
     * @param bot Client que irá executar os métodos
     * @param chat Interface da sala de bate-papo
     */
    static Inject<ChatIn extends IChat>(bot: Client, chat: ChatIn): ChatIn & Chat;
}
