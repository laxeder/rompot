import { StatusTypes } from "../types/Status";
import { Message } from "../messages/Message";
import { Chat } from "./Chat";
export declare class Status {
    status: StatusTypes;
    message?: Message;
    chat?: Chat;
    constructor(status: StatusTypes, chat?: Chat, message?: Message);
    /**
     * * Define a sala de bate-papo que está com o status
     * @param chat
     */
    setChat(chat: Chat | string): void;
}
