/// <reference types="node" />
import type { ChatStatus, ChatType } from "../types/Chat";
import type { Users } from "../types/User";
import { IMessage } from "../interfaces/IMessage";
import { IClient } from "../interfaces/IClient";
import { IUser } from "../interfaces/IUser";
import { IChat } from "../interfaces/IChat";
export default class Chat implements IChat {
    #private;
    type: ChatType;
    name: string;
    id: string;
    get client(): IClient;
    set client(client: IClient);
    constructor(id: string, type?: ChatType, name?: string);
    getName(): Promise<string>;
    setName(name: string): Promise<void>;
    getDescription(): Promise<string>;
    setDescription(description: string): Promise<void>;
    getProfile(): Promise<Buffer>;
    setProfile(image: Buffer): Promise<void>;
    IsAdmin(user: IUser | string): Promise<boolean>;
    IsLeader(user: IUser | string): Promise<boolean>;
    getAdmins(): Promise<Users>;
    getUsers(): Promise<Users>;
    addUser(user: IUser | string): Promise<void>;
    removeUser(user: IUser | string): Promise<void>;
    promote(user: IUser | string): Promise<void>;
    demote(user: IUser | string): Promise<void>;
    leave(): Promise<void>;
    send(message: IMessage | string): Promise<IMessage>;
    changeStatus(status: ChatStatus): Promise<void>;
    /**
     * @param chat Sala de bate-papo que será obtida
     * @returns Retorna a sala de bate-papo
     */
    static get<CHAT extends IChat>(chat: CHAT | string): CHAT | Chat;
    /**
     * @param chat Sala de bate-papo
     * @returns Retorna o ID da sala de bate-papo
     */
    static getId(chat: IChat | string): string;
    /**
     * * Cria uma sala de bate-papo com cliente instanciado
     * @param client Cliente
     * @param chat Sala de bate-papo
     */
    static Client<CHAT extends IChat>(client: IClient, chat: CHAT | string): CHAT | Chat;
}
