import Message from "@messages/Message";

import User from "@modules/User";
import Chat from "@modules/Chat";

export default class PollMessage extends Message {
  /** * Opções da enquete */
  public options: string[] = [];

  constructor(
    chat: Chat | string,
    text: string,
    options?: string[],
    mention?: Message,
    id?: string,
    user?: User | string,
    fromMe?: boolean,
    selected?: string,
    mentions?: string[],
    timestamp?: Number | Long
  ) {
    super(chat, text, mention, id, user, fromMe, selected, mentions, timestamp);

    this.options = options || [];
  }
}
