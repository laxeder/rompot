import { DataBase } from "./DataBase";
import { Commands } from "../models/Commands";
import { Message } from "../models/Message";
import { BaseBot } from "../utils/BaseBot";
import { Status } from "../models/Status";
import { Chat } from "../models/Chat";
export declare class Bot {
    private _awaitSendMessages;
    private _awaitSendMessagesObservers;
    private _autoMessages;
    private _plataform;
    private _db?;
    commands: Commands;
    constructor(plataform: BaseBot, commands?: Commands);
    /**
     * * Construir bot
     * @param auth
     * @param config
     */
    build(auth: string, config?: any): Promise<any>;
    /**
     * * Reconstruir o bot
     * @param config
     * @returns
     */
    rebuild(config?: any): Promise<any>;
    /**
     * * Obter Bot
     * @returns
     */
    get(): BaseBot;
    /**
     * * Obter DataBase
     * @returns
     */
    getDB(): DataBase | undefined;
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
    getChat(id: string): Chat | undefined;
    /**
     * * Retorna todas as salas de bate-papo
     * @returns
     */
    getChats(): {
        [key: string]: Chat;
    };
    /**
     * * Adiciona um evento
     * @param eventName
     * @param event
     */
    addEvent(eventName: "chats" | "messages" | "connection", event: any): void;
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
