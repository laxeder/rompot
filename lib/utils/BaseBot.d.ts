import { Events, BotInterface, EventsName } from "../types/index";
import { Message } from "../models/Message";
import { Status } from "../models/Status";
import { Chat } from "../models/Chat";
export declare class BaseBot implements BotInterface {
    events: Events;
    status: Status;
    chats: {
        [key: string]: Chat;
    };
    user: any;
    constructor();
    send(message: Message | Status): Promise<any>;
    connect(auth: any, config?: any): Promise<any>;
    reconnect(config?: any): Promise<any>;
    stop(reason?: any): Promise<any>;
    /**
     * * Adiciona um evento
     * @param eventName
     * @param event
     */
    addEvent(eventName: keyof EventsName, event: any): void;
}
