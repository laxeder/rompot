import { IContactMessage, IMessage } from "@interfaces/Messages";
import { IUser } from "@interfaces/User";
import { IChat } from "@interfaces/Chat";

import Message from "@messages/Message";

import User from "@modules/User";

import { getUser, UserClient } from "@utils/Generic";
import { IUsers } from "../types/User";

export default class ContactMessage extends Message implements IContactMessage {
  public contacts: User[] = [];

  constructor(
    chat: IChat | string,
    text: string,
    contacts: IUsers[] | string[],
    mention?: IMessage,
    id?: string,
    user?: IUser | string,
    fromMe?: boolean,
    selected?: string,
    mentions?: string[],
    timestamp?: Number | Long
  ) {
    super(chat, text, mention, id, user, fromMe, selected, mentions, timestamp);

    for (const contact in contacts) {
      this.contacts.push(UserClient(this.client, getUser(contact)));
    }
  }
}
