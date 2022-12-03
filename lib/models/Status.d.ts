import { StatusOptions } from "../types/Status";
import { Message } from "../messages/Message";
import { Chat } from "./Chat";
export declare class Status {
    status: keyof StatusOptions;
    chat?: Chat;
    message?: Message;
    constructor(status: keyof StatusOptions, chat?: Chat, message?: Message);
    /**
     * * Define o status
     * @param status
     */
    setStatus(status: keyof StatusOptions): void;
    /**
     * * Define a sala de bate-papo que está com o status
     * @param chat
     */
    setChat(chat: Chat): void;
    /**
     * * Define a mensagem que está com esse status
     * @param message
     */
    setMessage(message: Message): void;
    /**
     * * Retorna o status
     * @returns
     */
    getStatus(): string;
    /**
     * * retorna a sala de bate-papo que está com o status
     * @returns
     */
    getChat(): Chat | undefined;
    /**
     * *  Retorna a mensagem que está com esse status
     * @returns
     */
    getMessage(): Message | undefined;
}
