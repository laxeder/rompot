/// <reference types="long" />
import Message from "./Message";
import Chat from "../modules/Chat";
import User from "../modules/User";
import { Button } from "../types/Message";
export default class ButtonMessage extends Message {
    /** * Rodapé */
    footer: string;
    /** * Botões */
    buttons: Button[];
    /** * Tipo do botões */
    type: "template" | "plain";
    constructor(chat: Chat | string, text: string, footer?: string, mention?: Message, id?: string, user?: User | string, fromMe?: boolean, selected?: string, mentions?: string[], timestamp?: Number | Long);
    /**
     * * Adiciona um botão com uma url
     * @param text Texto da botão
     * @param url Url do botão
     * @param index Posição do botão
     */
    addUrl(text: string, url: string, index?: number): void;
    /**
     * * Adiciona um botão com um telefone
     * @param text Texto do botão
     * @param phone Tefefone do botão
     * @param index Posição do botão
     */
    addCall(text: string, phone: string, index?: number): void;
    /**
     * * Adiciona um botão respondivel
     * @param text Texto do botão
     * @param id ID do botão
     * @param index Posição do botão
     */
    addReply(text: string, id?: string, index?: number): void;
    /**
     * * Remove um botão
     * @param index Posição do botão
     */
    remove(index: number): void;
}
