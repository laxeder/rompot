import { MessageType } from "../enums/Message";
import { IChat } from "../interfaces/IChat";
import { IContactMessage } from "../interfaces/IMessage";
import { IUser } from "../interfaces/IUser";
import Message from "./Message";
export default class ContactMessage extends Message implements IContactMessage {
    readonly type = MessageType.Contact;
    contacts: IUser[];
    constructor(chat: IChat | string, text: string, contacts: Array<IUser | string>, others?: Partial<ContactMessage>);
}
