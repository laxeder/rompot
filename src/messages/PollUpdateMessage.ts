import type { PollAction, PollOption } from "../types/Message";

import { MessageType } from "@enums/Message";

import { IPollUpdateMessage } from "@interfaces/IMessage";
import { IChat } from "@interfaces/IChat";

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
