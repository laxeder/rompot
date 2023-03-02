/// <reference types="node" />
import { MessageInterface } from "../interfaces/MessagesInterfaces";
import UserInterface from "../interfaces/UserInterface";
import ChatInterface from "../interfaces/ChatInterface";
import Message from "../messages/Message";
import { ChatStatus, ChatType } from "../types/Chat";
import { Users } from "../types/User";
import { Bot } from "../types/Bot";
export default class Chat implements ChatInterface {
    id: string;
    type: ChatType;
    status: ChatStatus;
    name: string;
    description: string;
    profile: Buffer;
    users: Users;
    get bot(): Bot;
    constructor(id: string, type?: ChatType, name?: string, description?: string, profile?: Buffer, users?: Users, status?: ChatStatus);
    setName(name: string): Promise<void>;
    getName(): Promise<string>;
    getDescription(): Promise<string>;
    setDescription(description: string): Promise<void>;
    getProfile(): Promise<Buffer>;
    setProfile(image: Buffer): Promise<void>;
    IsAdmin(user: UserInterface | string): Promise<boolean>;
    IsLeader(user: UserInterface | string): Promise<boolean>;
    getAdmins(): Promise<Users>;
    addUser(user: UserInterface | string): Promise<void>;
    removeUser(user: UserInterface | string): Promise<void>;
    promote(user: UserInterface | string): Promise<void>;
    demote(user: UserInterface | string): Promise<void>;
    leave(): Promise<void>;
    send(message: MessageInterface | string): Promise<Message>;
    changeStatus(status: ChatStatus): Promise<void>;
    /**
     * @param chat Sala de bate-papo que será obtida
     * @returns Retorna a sala de bate-papo
     */
    static getChat<ChatIn extends ChatInterface>(chat: ChatIn | string): ChatIn | ChatInterface;
    /**
     * @param chat Sala de bate-papo
     * @returns Retorna o ID da sala de bate-papo
     */
    static getChatId(chat: ChatInterface | string): string;
    /**
     * * Injeta a interface no modulo
     * @param bot Bot que irá executar os métodos
     * @param chat Interface da sala de bate-papo
     */
    static Inject<ChatIn extends ChatInterface>(bot: Bot, chat: ChatIn): ChatIn & Chat;
}
