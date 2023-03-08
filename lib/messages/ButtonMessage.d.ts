/// <reference types="long" />
import { IButtonMessage, IMessage } from "../interfaces/Messages";
import { IUser } from "../interfaces/User";
import { IChat } from "../interfaces/Chat";
import Message from "./Message";
import { Button } from "../types/Message";
export default class ButtonMessage extends Message implements IButtonMessage {
    footer: string;
    buttons: Button[];
    constructor(chat: IChat | string, text: string, footer?: string, mention?: IMessage, id?: string, user?: IUser | string, fromMe?: boolean, selected?: string, mentions?: string[], timestamp?: Number | Long);
    addUrl(text: string, url: string, index?: number): void;
    addCall(text: string, phone: string, index?: number): void;
    addReply(text: string, id?: string, index?: number): void;
    remove(index: number): void;
}
