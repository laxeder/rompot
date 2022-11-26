import { Message } from "./Message";
import { Button } from "../types/Button";
import { Chat } from "./Chat";
export declare class ButtonMessage extends Message {
    buttons: Array<Button>;
    footer: string;
    type: number;
    constructor(chat: Chat, text: string, footer?: string, type?: number);
    /**
     * * Define o rodapé da mensagem
     * @param footer
     */
    setFooter(footer: string): void;
    /**
     * * Define o tipo da mensagem
     * @param type
     */
    setType(type: number): void;
    /**
     * * Adiciona um botão com uma url
     * @param text
     * @param url
     * @param index
     * @returns
     */
    addUrl(text: string, url: string, index?: number): ButtonMessage;
    /**
     * * Adiciona um botão com um telefone
     * @param text
     * @param call
     * @param index
     * @returns
     */
    addCall(text: string, phone: number, index?: number): ButtonMessage;
    /**
     * * Adiciona um botão respondivel
     * @param text
     * @param id
     * @param index
     * @returns
     */
    addReply(text: string, id?: string, index?: number): ButtonMessage;
    /**
     * * Remove um botão
     * @param index
     */
    remove(index: number): void;
    /**
     * * Gera um novo ID
     * @returns
     */
    generateID(): string;
}
