import Message from "@messages/Message";

import Chat from "@modules/Chat";
import User from "@modules/User";

export default class ReactionMessage extends Message {
  constructor(
    chat: Chat | string,
    reaction: string,
    receive: Message | string,
    id?: string,
    user?: User | string,
    fromMe?: boolean,
    selected?: string,
    mentions?: string[],
    timestamp?: Number | Long
  ) {
    super(chat, reaction, undefined, id, user, fromMe, selected, mentions, timestamp);

    if (receive instanceof Message) {
      this.id = receive.id;
    } else {
      this.id = receive;
    }
  }
}
