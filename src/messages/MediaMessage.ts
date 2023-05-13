import type { Media } from "../types/Message";

import { MessageType } from "@enums/Message";

import { IMediaMessage } from "@interfaces/IMessage";

import Message  from "@messages/Message";

import Chat from "@modules/Chat";

import { injectJSON } from "@utils/Generic";

export default class MediaMessage extends Message implements IMediaMessage {
  public readonly type: MessageType = MessageType.Media;

  public mimetype: string = "application/octet-stream";
  public file: Media | Buffer | string;
  public isGIF: boolean = false;
  public name: string = "";

  constructor(chat: Chat | string, text: string, file: Media | Buffer | string, others: Partial<MediaMessage> = {}) {
    super(chat, text);
    this.file = file;

    injectJSON(others, this);
  }

  /**
   * @returns Obter arquivo
   */
  public getStream(): Promise<Buffer> {
    return this.client.downloadStreamMessage(this);
  }
}
