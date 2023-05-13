import type { Media } from "../types/Message";

import { MessageType } from "@enums/Message";

import MediaMessage from "@messages/MediaMessage";

import Chat from "@modules/Chat";

import { injectJSON } from "@utils/Generic";

export default class ImageMessage extends MediaMessage {
  public readonly type: MessageType = MessageType.Image;

  constructor(chat: Chat | string, text: string, file: Media | Buffer | string, others: Partial<ImageMessage> = {}) {
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
