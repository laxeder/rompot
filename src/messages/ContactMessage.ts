import { MessageType } from "@enums/Message";

import Message from "@messages/Message";

import Chat from "@modules/Chat";
import User from "@modules/User";

import { injectJSON } from "@utils/Generic";

export default class ContactMessage extends Message {
  public readonly type: MessageType = MessageType.Contact;

  /** * Contatos */
  public contacts: User[] = [];

  constructor(chat: Chat | string, text: string, contacts: Array<User | string>, others: Partial<ContactMessage> = {}) {
    super(chat, text);

    for (const contact in contacts) {
      this.contacts.push(User.Client(this.client, User.get(contact)));
    }

    injectJSON(others, this);
  }
}
