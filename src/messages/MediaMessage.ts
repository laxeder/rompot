import { IChat, IMediaMessage, Media, MessageType } from "rompot-base";

import Message from "@messages/Message";

import { injectJSON } from "@utils/Generic";

export default class MediaMessage extends Message implements IMediaMessage {
  public readonly type: MessageType = MessageType.Media;

  public mimetype: string = "application/octet-stream";

  public file: Media | Buffer | string;
  public isGIF: boolean = false;
  public name: string = "";

  constructor(chat: IChat | string, text: string, file: Media | Buffer | string, others: Partial<MediaMessage> = {}) {
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
