import type { PollOption } from "../types/Message";

import { MessageType } from "@enums/Message";

import { PollMessage } from "@messages/index";

import Chat from "@modules/Chat";

import { injectJSON } from "@utils/Generic";

export default class PollUpdateMessage extends PollMessage {
  public readonly type: MessageType = MessageType.PollUpdate;

  /** * ação */
  public action?: "add" | "remove" | "create" = "create";

  constructor(chat: Chat | string, text: string, options?: PollOption[], others: Partial<PollUpdateMessage> = {}) {
    super(chat, text, options);

    injectJSON(others, this);
  }
}
