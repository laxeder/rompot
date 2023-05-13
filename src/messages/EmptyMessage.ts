import { MessageType } from "@enums/Message";

import Message from "@messages/Message";

export default class EmptyMessage extends Message {
  public readonly type: MessageType = MessageType.Empty;

  constructor() {
    super("", "");
  }
}
