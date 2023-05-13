import { MessageType } from "@enums/Message";
import { IChat } from "@interfaces/IChat";

import { IContactMessage } from "@interfaces/IMessage";
import { IUser } from "@interfaces/IUser";

import Message from "@messages/Message";
import User from "@modules/User";

import { ApplyClient, injectJSON } from "@utils/Generic";

export default class ContactMessage extends Message implements IContactMessage {
  public readonly type = MessageType.Contact;

  public contacts: IUser[] = [];

  constructor(chat: IChat | string, text: string, contacts: Array<IUser | string>, others: Partial<ContactMessage> = {}) {
    super(chat, text);

    for (let contact in contacts) {
      this.contacts.push(ApplyClient(User.get(contact), this.client));
    }

    injectJSON(others, this);
  }
}
