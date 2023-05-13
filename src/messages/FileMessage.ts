import type { Media } from "../types/Message";

import { MessageType } from "@enums/Message";

import MediaMessage from "@messages/MediaMessage";

import Chat from "@modules/Chat";

import { injectJSON } from "@utils/Generic";

export default class FileMessage extends MediaMessage {
  public readonly type: MessageType = MessageType.File;

  constructor(chat: Chat | string, text: string, file: Media | Buffer | string, others: Partial<FileMessage> = {}) {
    super(chat, text, file);

    injectJSON(others, this);
  }

  /**
   * @returns Obter arquivo
   */
  public getFile() {
    return this.getStream();
  }
}
