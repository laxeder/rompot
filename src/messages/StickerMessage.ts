import MediaMessage from "@messages/MediaMessage";
import Message from "@messages/Message";

import Chat from "@modules/Chat";
import User from "@modules/User";

import { Media } from "../types/Message";

export default class StickerMessage extends MediaMessage {
  /** * Titulo da figurinha */
  public title: string = "";
  /** * Descrição da figurinha */
  public description: string = "";

  constructor(chat: Chat | string, file: Media | Buffer | string, mention?: Message, id?: string, user?: User | string, fromMe?: boolean, selected?: string, mentions?: string[], timestamp?: Number | Long) {
    super(chat, "", file, mention, id, user, fromMe, selected, mentions, timestamp);
  }

  /**
   * @returns Obter figurinha
   */
  public getSticker() {
    return this.getStream();
  }
}
