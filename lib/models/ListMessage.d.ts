import { List, ListItem } from "../types/List";
import { Message } from "./Message";
import { Chat } from "./Chat";
export declare class ListMessage extends Message {
    list: Array<List>;
    buttonText: string;
    footer: string;
    title: string;
    add?: Function;
    constructor(chat: Chat, title: string, text: string, footer: string, buttonText: string);
    /**
     * * Adiciona uma seção
     * @param title
     * @param items
     * @returns
     */
    addCategory(title: string, items?: Array<ListItem>): number;
    /**
     * * Adiciona um item a lista
     * @param index
     * @param title
     * @param description
     * @param id
     * @returns
     */
    addItem(index: number, title: string, description?: string, id?: string): number;
    /**
     * * Gera um novo ID
     * @returns
     */
    generateID(): string;
}
