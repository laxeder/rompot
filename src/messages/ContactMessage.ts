import { IChat, IContactMessage, IUser, MessageType } from "rompot-base";

import Message from "@messages/Message";

import { UserUtils } from "@modules/user";

import { injectJSON } from "@utils/Generic";

export default class ContactMessage extends Message implements IContactMessage {
  public readonly type = MessageType.Contact;

  public contacts: Record<string, IUser> = {};

  constructor(chat: IChat | string, text: string, contacts: Array<IUser | string>, others: Partial<ContactMessage> = {}) {
    super(chat, text);

    for (let contact in contacts) {
      const user = UserUtils.applyClient(this.client, contact);

      this.contacts[user.id] = user;
    }

    injectJSON(others, this);
  }
}
