import { IChat, IListMessage, List, ListItem, MessageType } from "rompot-base";
import Message from "./Message";
export default class ListMessage extends Message implements IListMessage {
    readonly type = MessageType.List;
    list: List[];
    button: string;
    footer: string;
    title: string;
    constructor(chat: IChat | string, text: string, button: string, footer?: string, title?: string, others?: Partial<ListMessage>);
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
