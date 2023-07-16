import { IEmptyMessage, MessageType } from "rompot-base";

import Message from "@messages/Message";

export default class EmptyMessage extends Message implements IEmptyMessage {
  public readonly type = MessageType.Empty;

  constructor() {
    super("", "");
  }
}
