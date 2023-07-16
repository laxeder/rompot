import { IChat, ITextMessage, MessageType } from "rompot-base";

import Message from "@messages/Message";

export default class TextMessage extends Message implements ITextMessage {
  public readonly type: MessageType.Text = MessageType.Text;

  constructor(chat: IChat | string, text: string, others: Partial<ITextMessage> = {}) {
    super(chat, text, others);
  }
}
