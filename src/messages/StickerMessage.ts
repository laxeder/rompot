import MediaMessage from "@messages/MediaMessage";
import Message from "@messages/Message";

import Chat from "@modules/Chat";
import User from "@modules/User";
import { Categories } from "wa-sticker-formatter/dist";

import { Media } from "../types/Message";

export default class StickerMessage extends MediaMessage {
  /** * Criador da figurinha */
  public author: string = "";
  /** * Pacote da figurinha */
  public pack: string = "";
  /** * Categoria da figurinha */
  public categories: Categories[] = [];

  constructor(
    chat: Chat | string,
    file: Media | Buffer | string,
    mention?: Message,
    id?: string,
    user?: User | string,
    fromMe?: boolean,
    selected?: string,
    mentions?: string[],
    timestamp?: Number | Long
  ) {
    super(chat, "", file, mention, id, user, fromMe, selected, mentions, timestamp);
  }

  /**
   * @returns Obter figurinha
   */
  public getSticker() {
    return this.getStream();
  }
}
