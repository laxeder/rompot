/// <reference types="long" />
import { IListMessage, IMessage } from "@interfaces/Messages";
import { IUser } from "@interfaces/User";
import { IChat } from "@interfaces/Chat";
import Message from "@messages/Message";
import { List, ListItem } from "../types/Message";
export default class ListMessage extends Message implements IListMessage {
    button: string;
    footer: string;
    title: string;
    list: List[];
    constructor(chat: IChat | string, text: string, button: string, footer?: string, title?: string, mention?: IMessage, id?: string, user?: IUser | string, fromMe?: boolean, selected?: string, mentions?: string[], timestamp?: Number | Long);
    addCategory(title: string, items?: ListItem[]): number;
    addItem(index: number, title: string, description?: string, id?: string): number;
}
