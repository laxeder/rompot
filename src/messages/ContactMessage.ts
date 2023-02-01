import { ContactMessageInterface } from "@interfaces/MessagesInterfaces";
import ChatInterface from "@interfaces/ChatInterface";

import Message from "@messages/Message";

import { BotModule } from "../types/BotModule";

//@ts-ignore
export default class ContactMessage extends Message implements ContactMessageInterface {
  public contacts: string[] = [];

  constructor(chat: ChatInterface | string, text: string, contacts: string | string[], mention?: Message, id?: string) {
    super(chat, text, mention, id);

    if (Array.isArray(contacts)) {
      contacts.forEach((contact) => {
        this.contacts.push(contact);
      });
    } else {
      this.contacts.push(contacts || "");
    }
  }

  /**
   * * Injeta a interface no modulo
   * @param bot Bot que irá executar os métodos
   * @param message Interface da mensagem
   */
  public static Inject<MessageIn extends ContactMessageInterface>(bot: BotModule, msg: MessageIn): MessageIn & ContactMessage {
    const module: ContactMessage = new ContactMessage(msg.chat, msg.text, msg.contacts);

    module.inject(bot, msg);

    return { ...msg, ...module };
  }
}
