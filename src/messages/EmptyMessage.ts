import Message from "@messages/Message";

export default class EmptyMessage extends Message {
  constructor() {
    super("", "");
  }
}
