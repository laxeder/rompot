import { MessageType } from "@enums/Message";

import { IMessage, IReactionMessage } from "@interfaces/IMessage";
import { IChat } from "@interfaces/IChat";

import { Message } from "@messages/index";

import { injectJSON } from "@utils/Generic";

export default class ReactionMessage extends Message implements IReactionMessage {
  public readonly type = MessageType.Reaction;

  constructor(chat: IChat | string, reaction: string, receive: IMessage | string, others: Partial<ReactionMessage> = {}) {
    super(chat, reaction);

    if (typeof receive === "string") {
      this.id = receive;
    } else {
      this.id = receive.id;
    }

    injectJSON(others, this);
  }
}
