/// <reference types="long" />
import { IContactMessage, IMessage } from "../interfaces/Messages";
import { IUser } from "../interfaces/User";
import { IChat } from "../interfaces/Chat";
import Message from "./Message";
import User from "../modules/User";
import { IUsers } from "../types/User";
export default class ContactMessage extends Message implements IContactMessage {
    contacts: User[];
    constructor(chat: IChat | string, text: string, contacts: IUsers[] | string[], mention?: IMessage, id?: string, user?: IUser | string, fromMe?: boolean, selected?: string, mentions?: string[], timestamp?: Number | Long);
}
