import Message from "@messages/Message";

import Chat from "@modules/Chat";
import User from "@modules/User";

export default class ContactMessage extends Message {
  /** * Contatos */
  public contacts: User[] = [];

  constructor(
    chat: Chat | string,
    text: string,
    contacts: Array<User | string>,
    mention?: Message,
    id?: string,
    user?: User | string,
    fromMe?: boolean,
    selected?: string,
    mentions?: string[],
    timestamp?: Number | Long
  ) {
    super(chat, text, mention, id, user, fromMe, selected, mentions, timestamp);

    for (const contact in contacts) {
      this.contacts.push(User.Client(this.client, User.get(contact)));
    }
  }
}
