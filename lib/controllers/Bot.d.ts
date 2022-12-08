import { BuildConfig } from "../config/BuildConfig";
import { DataBase } from "./DataBase";
import { EventsName } from "../types/Events";
import { Commands } from "../models/Commands";
import { Message } from "../messages/Message";
import { BaseBot } from "../utils/BaseBot";
import { Status } from "../models/Status";
import { Chat } from "../models/Chat";
import { User } from "../models/User";
export declare class Bot {
    private _awaitSendMessages;
    private _awaitSendMessagesObservers;
    private _autoMessages;
    private _plataform;
    private _db;
    config: BuildConfig;
    commands: Commands;
    constructor(plataform: BaseBot, commands?: Commands, db?: DataBase);
    setCommands(commands: Commands): void;
    /**
     * * Construir bot
     * @param auth
     * @param config
     */
    build(auth: string, config?: BuildConfig): Promise<any>;
    /**
     * * Reconstruir o bot
     * @param config
     * @returns
     */
    rebuild(config?: BuildConfig): Promise<any>;
    /**
     * * Obter Bot
     * @returns
     */
    getBot(): BaseBot;
    /**
     * * Retorna um comando
     * @param cmd
     * @param commands
     * @returns
     */
    getCMD(cmd: string, commands?: Commands): import("../models/Commands").Command | undefined;
    /**
     * * Obter DataBase
     * @returns
     */
    getDB(): DataBase;
    /**
     * * Definir DataBase
     */
    setDB(DB: DataBase): void;
    /**
     * * Retorna o status do bot
     * @returns
     */
    getStatus(): Status;
    /**
     * * Retorna uma salade bate-papo
     * @param id
     * @returns
     */
    getChat(id: string): Promise<any>;
    /**
     * * Retorna todas as salas de bate-papo
     * @returns
     */
    getChats(): Promise<any>;
    /**
     * * Define uma sala de bate-papo
     * @param chat
     */
    setChat(chat: Chat): Promise<void>;
    /**
     * * Define as salas de bate-papo
     * @param chats
     */
    setChats(chats: {
        [key: string]: Chat;
    }): Promise<void>;
    /**
     * * Remove uma sala de bate-papo
     * @param id
     */
    removeChat(id: Chat | string): Promise<void>;
    /**
     * * Adiciona um usuário a uma sala de bate-papo
     * @param chat
     * @param user
     */
    addMember(chat: Chat, user: User): Promise<void>;
    /**
     * * Remove um usuário da sala de bate-papo
     * @param chat
     * @param user
     */
    removeMember(chat: Chat, user: User): Promise<void>;
    /**
     * * Remove uma mensagem da sala de bate-papo
     * @param message
     * @returns
     */
    removeMessage(message: Message): Promise<any>;
    /**
     * * Deleta uma mensagem da sala de bate-papo
     * @param message
     * @returns
     */
    deleteMessage(message: Message): Promise<any>;
    /**
     * * Adiciona um evento
     * @param name
     * @param event
     */
    on(name: keyof EventsName, event: Function): import("rxjs").Subscription;
    /**
     * * Envia um conteúdo
     * @param content
     * @returns
     */
    send(content: Message | Status, interval?: number): Promise<any>;
    /**
     * * Adiciona a mensagem há uma lista de mensagens para serem enviadas
     * @param message
     * @param interval
     * @returns
     */
    addMessage(message: Message, interval?: number): Promise<any>;
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
     * @param interval
     * @param chats
     * @param id
     * @returns
     */
    addAutomate(message: Message, timeout: number, interval?: number, chats?: {
        [key: string]: Chat;
    }, id?: string): Promise<any>;
}
