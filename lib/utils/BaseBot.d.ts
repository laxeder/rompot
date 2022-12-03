import { OperatorFunction } from "rxjs";
import { Events, BotInterface, EventsName } from "../types/index";
import { Message } from "../messages/Message";
import { Status } from "../models/Status";
import { Chat } from "../models/Chat";
import { User } from "../models/User";
export declare class BaseBot implements BotInterface {
    events: Events;
    status: Status;
    user: any;
    constructor();
    send(message: Message | Status): Promise<any>;
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
    /**
     * * Adiciona um evento
     * @param eventName
     * @param event
     * @returns
     */
    on(eventName: keyof EventsName, event: any, pipe?: OperatorFunction<any, unknown>): import("rxjs").Subscription;
}
