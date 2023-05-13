import { MessageType } from "@enums/Message";

import { IMessage } from "@interfaces/IMessage";

import { Message } from "@messages/index";

import Chat from "@modules/Chat";

import { injectJSON } from "@utils/Generic";

export default class ReactionMessage extends Message {
  public readonly type: MessageType = MessageType.Reaction;

  constructor(chat: Chat | string, reaction: string, receive: IMessage | string, others: Partial<ReactionMessage> = {}) {
    super(chat, reaction);

    if (typeof receive === "string") {
      this.id = receive;
    } else {
      this.id = receive.id;
    }

    injectJSON(others, this);
  }
}
