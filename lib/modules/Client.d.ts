/// <reference types="node" />
import { ConnectionConfig } from "../config/ConnectionConfig";
import { IClient } from "../interfaces/IClient";
import Command from "./Command";
import IAuth from "../interfaces/IAuth";
import IBot from "../interfaces/IBot";
import MediaMessage from "../messages/MediaMessage";
import Message from "../messages/Message";
import User from "./User";
import Chat from "./Chat";
import PromiseMessages from "../utils/PromiseMessages";
import { ClientEvents } from "../utils/Emmiter";
import { Chats, ChatStatus } from "../types/Chat";
import { Users } from "../types/User";
export default class Client<Bot extends IBot> extends ClientEvents implements IClient {
    promiseMessages: PromiseMessages;
    autoMessages: any;
    bot: Bot;
    config: ConnectionConfig;
    commands: Command[];
    get id(): string;
    get status(): import("..").BotStatus;
    constructor(bot: Bot, config?: Partial<ConnectionConfig>, commands?: Command[]);
    configEvents(): void;
    connect(auth: IAuth | string): Promise<void>;
    reconnect(alert?: boolean): Promise<void>;
    stop(reason: any): Promise<void>;
    setCommands(commands: Command[]): void;
    getCommands(): Command[];
    addCommand(command: Command): void;
    removeCommand(command: Command): void;
    getCommand(command: string | Command): Command | null;
    deleteMessage(message: Message): Promise<void>;
    removeMessage(message: Message): Promise<void>;
    addReaction(message: Message, reaction: string): Promise<void>;
    addAnimatedReaction(message: Message, reactions: string[], interval?: number, maxTimeout?: number): (reactionStop?: string) => Promise<void>;
    readMessage(message: Message): Promise<void>;
    removeReaction(message: Message): Promise<void>;
    send(message: Message): Promise<Message>;
    awaitMessage(chat: Chat | string, ignoreMessageFromMe?: boolean, stopRead?: boolean, ...ignoreMessages: Message[]): Promise<Message>;
    addAutomate(message: Message, timeout: number, chats?: Chats, id?: string): Promise<any>;
    /**
     * * Retorna a stream da mídia
     * @param message Mídia que será baixada
     * @returns Stream da mídia
     */
    downloadStreamMessage(message: MediaMessage): Promise<Buffer>;
    getBotName(): Promise<string>;
    setBotName(name: string): Promise<void>;
    getBotDescription(): Promise<string>;
    setBotDescription(description: string): Promise<void>;
    getBotProfile(): Promise<Buffer>;
    setBotProfile(profile: Buffer): Promise<void>;
    getChat(chat: Chat | string): Promise<Chat | null>;
    setChat(chat: Chat): Promise<void>;
    getChats(): Promise<Chats>;
    setChats(chats: Chats): Promise<void>;
    addChat(chat: string | Chat): Promise<void>;
    removeChat(chat: string | Chat): Promise<void>;
    getChatName(chat: Chat | string): Promise<string>;
    setChatName(chat: Chat | string, name: string): Promise<void>;
    getChatDescription(chat: Chat | string): Promise<string>;
    setChatDescription(chat: Chat | string, description: string): Promise<void>;
    getChatProfile(chat: Chat | string): Promise<Buffer>;
    setChatProfile(chat: Chat | string, profile: Buffer): Promise<void>;
    changeChatStatus(chat: Chat | string, status: ChatStatus): Promise<void>;
    addUserInChat(chat: Chat | string, user: User | string): Promise<void>;
    removeUserInChat(chat: Chat | string, user: User | string): Promise<void>;
    promoteUserInChat(chat: Chat | string, user: User | string): Promise<void>;
    demoteUserInChat(chat: Chat | string, user: User): Promise<void>;
    createChat(chat: Chat): Promise<void>;
    leaveChat(chat: Chat | string): Promise<void>;
    getChatAdmins(chat: Chat | string): Promise<Users>;
    getChatLeader(chat: Chat | string): Promise<User>;
    getUser(user: User | string): Promise<User | null>;
    setUser(user: User | string): Promise<void>;
    getUsers(): Promise<Users>;
    setUsers(users: Users): Promise<void>;
    addUser(user: User | string): Promise<void>;
    removeUser(user: User | string): Promise<void>;
    getUserName(user: User | string): Promise<string>;
    setUserName(user: User | string, name: string): Promise<void>;
    getUserDescription(user: User | string): Promise<string>;
    setUserDescription(user: User | string, description: string): Promise<void>;
    getUserProfile(user: User | string): Promise<Buffer>;
    setUserProfile(user: User | string, profile: Buffer): Promise<void>;
    unblockUser(user: User | string): Promise<void>;
    blockUser(user: User | string): Promise<void>;
}
