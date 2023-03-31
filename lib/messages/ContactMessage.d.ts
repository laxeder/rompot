/// <reference types="long" />
import Message from "./Message";
import Chat from "../modules/Chat";
import User from "../modules/User";
export default class ContactMessage extends Message {
    /** * Contatos */
    contacts: User[];
    constructor(chat: Chat | string, text: string, contacts: Array<User | string>, mention?: Message, id?: string, user?: User | string, fromMe?: boolean, selected?: string, mentions?: string[], timestamp?: Number | Long);
}
