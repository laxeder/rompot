/// <reference types="node" />
import { ConnectionConfig } from "../config/ConnectionConfig";
import { Commands } from "./Commands";
import { Message } from "../messages/Message";
import { Emmiter } from "../utils/Emmiter";
import { Status } from "./Status";
import { Chat } from "./Chat";
import { User } from "./User";
export declare class Bot extends Emmiter {
    private pb;
    private pbNames;
    private _autoMessages;
    private _commands?;
    status: Status;
    config: ConnectionConfig | any;
    id: string;
    constructor(commands?: Commands);
    /**
     * * Define a lista de comandos
     * @param commands
     */
    setCommands(commands: Commands): void;
    /**
     * * Retorna um comando
     * @param cmd
     * @param commands
     * @returns
     */
    getCommand(cmd: string, commands?: Commands): import("./Command").Command | undefined;
    /**
     * * Retorna os comandos do bot
     * @returns
     */
    getCommands(): Commands;
    /**
     * * Envia um conteúdo
     * @param content
     * @returns
     */
    send(content: Message | Status): Promise<any | Message>;
    /**
     * * Adiciona uma chamada há uma lista de chamadas para serem chamadas
     * @param fn
     * @returns
     */
    add(fn: Function): Promise<any>;
    /**
     * * Cria um tempo de espera
     * @param timeout
     * @returns
     */
    sleep(timeout?: number): Promise<any>;
    /**
     * * Automotiza uma mensagem
     * @param message
     * @param timeout
     * @param chats
     * @param id
     * @returns
     */
    addAutomate(message: Message, timeout: number, chats?: {
        [key: string]: Chat;
    }, id?: string): Promise<any>;
    sendMessage(message: Message): Promise<Message>;
    sendStatus(status: Status): Promise<any>;
    connect(auth: any, config?: any): Promise<any>;
    reconnect(config?: any): Promise<any>;
    stop(reason?: any): Promise<any>;
    getChat(id: string): Promise<any>;
    setChat(chat: Chat): Promise<void>;
    getChats(): Promise<any>;
    setChats(chat: {
        [key: string]: Chat;
    }): Promise<void>;
    removeChat(id: Chat | string): Promise<void>;
    addMember(chat: Chat, user: User): Promise<void>;
    removeMember(chat: Chat, user: User): Promise<void>;
    deleteMessage(message: Message): Promise<any>;
    removeMessage(message: Message): Promise<any>;
    deleteChat(message: Message): Promise<any>;
    setDescription(desc: string, id?: Chat | string): Promise<any>;
    getDescription(id?: User | string): Promise<any>;
    setChatName(id: Chat | string, name: string): Promise<any>;
    createChat(name: string): Promise<any>;
    leaveChat(chat: Chat | string): Promise<any>;
    unblockUser(user: User): Promise<any>;
    blockUser(user: User): Promise<any>;
    setBotName(name: string): Promise<any>;
    setProfile(image: Buffer, id?: Chat | string): Promise<any>;
    getProfile(id?: Chat | User | string): Promise<any>;
}
