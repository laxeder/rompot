import type { Media } from "../types/Message";

import { Categories } from "@laxeder/wa-sticker/dist";

import { MessageType } from "@enums/Message";

import { MediaMessage } from "@messages/index";

import Chat from "@modules/Chat";

import { injectJSON } from "@utils/Generic";

export default class StickerMessage extends MediaMessage {
  public readonly type: MessageType = MessageType.Sticker;

  /** * Criador da figurinha */
  public author: string = "";
  /** * Pacote da figurinha */
  public pack: string = "";
  /** * Categoria da figurinha */
  public categories: Categories[] = [];
  /** * ID da figurinha */
  public stickerId: string = "";

  public mimetype: string = "image/webp";

  constructor(chat: Chat | string, file: Media | Buffer | string, others: Partial<StickerMessage> = {}) {
    super(chat, "", file);

    injectJSON(others, this);
  }

  /**
   * @returns Obter figurinha
   */
  public getSticker() {
    return this.getStream();
  }
}
