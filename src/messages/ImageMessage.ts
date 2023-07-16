import { IChat, IImageMessage, Media, MessageType } from "rompot-base";

import MediaMessage from "@messages/MediaMessage";

import { injectJSON } from "@utils/Generic";

export default class ImageMessage extends MediaMessage implements IImageMessage {
  public readonly type = MessageType.Image;

  public mimetype: string = "image/png";

  constructor(chat: IChat | string, text: string, file: Media | Buffer | string, others: Partial<ImageMessage> = {}) {
    super(chat, text, file);

    injectJSON(others, this);
  }

  /**
   * @returns Obter imagem
   */
  public getImage() {
    return this.getStream();
  }
}
