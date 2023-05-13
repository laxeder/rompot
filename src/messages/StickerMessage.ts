import type { Media } from "../types/Message";

import { Categories } from "@laxeder/wa-sticker/dist";

import { MessageType } from "@enums/Message";

import { IStickerMessage } from "@interfaces/IMessage";
import { IChat } from "@interfaces/IChat";

import { MediaMessage } from "@messages/index";

import { injectJSON } from "@utils/Generic";

export default class StickerMessage extends MediaMessage implements IStickerMessage {
  public readonly type = MessageType.Sticker;

  public mimetype: string = "image/webp";

  public categories: Categories[] = [];
  public stickerId: string = "";
  public author: string = "";
  public pack: string = "";

  constructor(chat: IChat | string, file: Media | Buffer | string, others: Partial<StickerMessage> = {}) {
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
