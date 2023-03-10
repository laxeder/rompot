/// <reference types="long" />
import Message from "./Message";
import Chat from "../modules/Chat";
import User from "../modules/User";
import { List, ListItem } from "../types/Message";
export default class ListMessage extends Message {
    /** * Botão */
    button: string;
    /** * Rodapé */
    footer: string;
    /** * Titulo */
    title: string;
    /** * Lista */
    list: List[];
    constructor(chat: Chat | string, text: string, button: string, footer?: string, title?: string, mention?: Message, id?: string, user?: User | string, fromMe?: boolean, selected?: string, mentions?: string[], timestamp?: Number | Long);
    /**
     * * Adiciona uma seção
     * @param title Titulo da lista
     * @param items Items da lista
     * @returns Categoria criada
     */
    addCategory(title: string, items?: ListItem[]): number;
    /**
     * * Adiciona um item a lista
     * @param index Categoria do item
     * @param title Titulo do item
     * @param description Descrição do item
     * @param id ID do item
     */
    addItem(index: number, title: string, description?: string, id?: string): number;
}
