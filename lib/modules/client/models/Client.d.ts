/// <reference types="node" />
import { BotStatus, ChatStatus, ConnectionConfig, IAuth, IBot, IChat, IClient, ICommand, ICommandController, IMediaMessage, IMessage, IPromiseMessage, IUser, PromiseMessageConfig } from "rompot-base";
import ClientEvents from "../../client/events/ClientEvents";
export default class Client<Bot extends IBot> extends ClientEvents implements IClient {
    promiseMessages: IPromiseMessage;
    autoMessages: any;
    bot: Bot;
    config: ConnectionConfig;
    commandController: ICommandController;
    reconnectTimes: number;
    get id(): string;
    set id(id: string);
    get status(): BotStatus;
    set status(status: BotStatus);
    constructor(bot: Bot, config?: Partial<ConnectionConfig>);
    configEvents(): void;
    connect(auth: IAuth | string): Promise<void>;
    connectByCode(phoneNumber: number | string, auth: string | IAuth): Promise<string>;
    reconnect(alert?: boolean): Promise<void>;
    stop(reason?: any): Promise<void>;
    getCommandController(): ICommandController;
    setCommandController(controller: ICommandController): void;
    setCommands(commands: ICommand[]): void;
    getCommands(): ICommand[];
    addCommand(command: ICommand): void;
    removeCommand(command: ICommand): boolean;
    searchCommand(text: string): ICommand | null;
    runCommand(command: ICommand, message: IMessage, type?: string): any;
    deleteMessage(message: IMessage): Promise<void>;
    removeMessage(message: IMessage): Promise<void>;
    readMessage(message: IMessage): Promise<void>;
    editMessage(message: IMessage, text: string): Promise<void>;
    addReaction(message: IMessage, reaction: string): Promise<void>;
    removeReaction(message: IMessage): Promise<void>;
    addAnimatedReaction(message: IMessage, reactions: string[], interval?: number, maxTimeout?: number): (reactionStop?: string) => Promise<void>;
    send(message: IMessage): Promise<IMessage>;
    sendMessage(chat: IChat | string, message: string | IMessage, mention?: IMessage): Promise<IMessage>;
    awaitMessage(chat: IChat | string, config?: Partial<PromiseMessageConfig>): Promise<IMessage>;
    /**
     * * Retorna a stream da mídia
     * @param message Mídia que será baixada
     * @returns Stream da mídia
     */
    downloadStreamMessage(message: IMediaMessage): Promise<Buffer>;
    getBotName(): Promise<string>;
    setBotName(name: string): Promise<void>;
    getBotDescription(): Promise<string>;
    setBotDescription(description: string): Promise<void>;
    getBotProfile(): Promise<Buffer>;
    setBotProfile(profile: Buffer): Promise<void>;
    getChat(chat: IChat | string): Promise<IChat | null>;
    setChat(chat: IChat): Promise<void>;
    getChats(): Promise<Record<string, IChat>>;
    setChats(chats: Record<string, IChat>): Promise<void>;
    addChat(chat: string | IChat): Promise<void>;
    removeChat(chat: string | IChat): Promise<void>;
    getChatName(chat: IChat | string): Promise<string>;
    setChatName(chat: IChat | string, name: string): Promise<void>;
    getChatDescription(chat: IChat | string): Promise<string>;
    setChatDescription(chat: IChat | string, description: string): Promise<void>;
    getChatProfile(chat: IChat | string): Promise<Buffer>;
    setChatProfile(chat: IChat | string, profile: Buffer): Promise<void>;
    changeChatStatus(chat: IChat | string, status: ChatStatus): Promise<void>;
    addUserInChat(chat: IChat | string, user: IUser | string): Promise<void>;
    removeUserInChat(chat: IChat | string, user: IUser | string): Promise<void>;
    promoteUserInChat(chat: IChat | string, user: IUser | string): Promise<void>;
    demoteUserInChat(chat: IChat | string, user: IUser): Promise<void>;
    createChat(chat: IChat): Promise<void>;
    leaveChat(chat: IChat | string): Promise<void>;
    getChatUsers(chat: IChat | string): Promise<Record<string, IUser>>;
    getChatAdmins(chat: IChat | string): Promise<Record<string, IUser>>;
    getChatLeader(chat: IChat | string): Promise<IUser>;
    getUser(user: IUser | string): Promise<IUser | null>;
    setUser(user: IUser | string): Promise<void>;
    getUsers(): Promise<Record<string, IUser>>;
    setUsers(users: Record<string, IUser>): Promise<void>;
    addUser(user: IUser | string): Promise<void>;
    removeUser(user: IUser | string): Promise<void>;
    getUserName(user: IUser | string): Promise<string>;
    setUserName(user: IUser | string, name: string): Promise<void>;
    getUserDescription(user: IUser | string): Promise<string>;
    setUserDescription(user: IUser | string, description: string): Promise<void>;
    getUserProfile(user: IUser | string): Promise<Buffer>;
    setUserProfile(user: IUser | string, profile: Buffer): Promise<void>;
    unblockUser(user: IUser | string): Promise<void>;
    blockUser(user: IUser | string): Promise<void>;
}
