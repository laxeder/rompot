import { IChat, IPollUpdateMessage, MessageType, PollAction, PollOption } from "rompot-base";

import { PollMessage } from "@messages/index";

import { injectJSON } from "@utils/Generic";

export default class PollUpdateMessage extends PollMessage implements IPollUpdateMessage {
  public readonly type = MessageType.PollUpdate;

  public action: PollAction = "add";

  constructor(chat: IChat | string, text: string, options?: PollOption[], others: Partial<PollUpdateMessage> = {}) {
    super(chat, text, options);

    injectJSON(others, this);
  }
}
