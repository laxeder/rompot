import { MessageType } from "@enums/Message";

import { IEmptyMessage } from "@interfaces/IMessage";

import Message from "@messages/Message";

export default class EmptyMessage extends Message implements IEmptyMessage {
  public readonly type = MessageType.Empty;

  constructor() {
    super("", "");
  }
}
