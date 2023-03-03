import { IContactMessage } from "@interfaces/Messages";
import { IChat } from "@interfaces/Chat";

import Message from "@messages/Message";

export default class ContactMessage extends Message implements IContactMessage {
  public contacts: string[] = [];

  constructor(chat: IChat | string, text: string, contacts: string | string[], mention?: Message, id?: string) {
    super(chat, text, mention, id);

    if (Array.isArray(contacts)) {
      contacts.forEach((contact) => {
        this.contacts.push(contact);
      });
    } else {
      this.contacts.push(contacts || "");
    }
  }
}
