import type { Media } from "../types/Message";

import { MessageType } from "@enums/Message";

import { IFileMessage } from "@interfaces/IMessage";
import { IChat } from "@interfaces/IChat";

import MediaMessage from "@messages/MediaMessage";

import { injectJSON } from "@utils/Generic";

export default class FileMessage extends MediaMessage implements IFileMessage {
  public readonly type = MessageType.File;

  constructor(chat: IChat | string, text: string, file: Media | Buffer | string, others: Partial<FileMessage> = {}) {
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
