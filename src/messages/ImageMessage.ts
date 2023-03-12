import MediaMessage from "@messages/MediaMessage";
import Message from "@messages/Message";

import Chat from "@modules/Chat";
import User from "@modules/User";

import { Media } from "../types/Message";

export default class ImageMessage extends MediaMessage {
  constructor(
    chat: Chat | string,
    text: string,
    file: Media | Buffer | string,
    mention?: Message,
    id?: string,
    user?: User | string,
    fromMe?: boolean,
    selected?: string,
    mentions?: string[],
    timestamp?: Number | Long
  ) {
    super(chat, text, file, mention, id, user, fromMe, selected, mentions, timestamp);
  }

  /**
   * @returns Obter imagem
   */
  public getImage() {
    return this.getStream();
  }
}
