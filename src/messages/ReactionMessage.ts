import Message from "@messages/Message";

import Chat from "@modules/Chat";

export default class ReactionMessage extends Message {
  constructor(chat: Chat | string, reaction: string, receive: Message | string) {
    super(chat, reaction);

    if (receive instanceof Message) {
      this.id = receive.id;
    } else {
      this.id = receive;
    }
  }
}
