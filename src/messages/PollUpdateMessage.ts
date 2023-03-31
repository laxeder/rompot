import Message from "@messages/Message";

import PollMessage from "@messages/PollMessage";

import User from "@modules/User";
import Chat from "@modules/Chat";

import { PollOption } from "../types/Message";

export default class PollUpdateMessage extends PollMessage {
  /** * ação */
  public action?: "add" | "remove" | "create" = "create";

  constructor(
    chat: Chat | string,
    text: string,
    options?: PollOption[],
    mention?: Message,
    id?: string,
    user?: User | string,
    fromMe?: boolean,
    selected?: string,
    mentions?: string[],
    timestamp?: Number | Long
  ) {
    super(chat, text, options, mention, id, user, fromMe, selected, mentions, timestamp);

    this.options = options || [];
  }
}
