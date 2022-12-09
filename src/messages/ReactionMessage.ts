import { Message } from "@messages/Message";
import { Chat } from "@models/Chat";

export class ReactionMessage extends Message {
  constructor(chat: Chat, text: string, idMessage: Message | string) {
    super(chat, text);

    if (idMessage instanceof Message) {
      this.setId(idMessage.id || "");
    } else this.setId(idMessage);
  }
}
