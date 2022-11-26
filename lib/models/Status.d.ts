import { StatusOptions } from "../types/Status";
import { Chat } from "./Chat";
export declare class Status {
    status: keyof StatusOptions;
    chat?: Chat;
    id?: string;
    constructor(status: keyof StatusOptions, chat?: Chat, id?: string);
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
     * * Define o ID da mensagem que está com esse status
     * @param id
     */
    setId(id: string): void;
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
     * *  Retorna o ID da mensagem que está com esse status
     * @returns
     */
    getId(): string | undefined;
}
