import { IChat, IContactMessage, IUser, MessageType } from "rompot-base";
import Message from "./Message";
export default class ContactMessage extends Message implements IContactMessage {
    readonly type = MessageType.Contact;
    contacts: Record<string, IUser>;
    constructor(chat: IChat | string, text: string, contacts: Array<IUser | string>, others?: Partial<ContactMessage>);
}
