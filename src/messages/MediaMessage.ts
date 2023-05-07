import Message from "@messages/Message";

import Chat from "@modules/Chat";
import User from "@modules/User";

import { Media } from "../types/Message";

export default class MediaMessage extends Message {
  /** * Arquivo da mensagem */
  public file: Media | Buffer | string;
  /** * O arquivo é um GIF */
  public isGIF: boolean = false;
  /** * MimeType */
  public mimetype: string = "application/octet-stream";
  /** * Nome do arquivo */
  public name: string = "";

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
    super(chat, text, mention, id, user, fromMe, selected, mentions, timestamp);
    this.file = file;
  }

  /**
   * @returns Obter arquivo
   */
  public getStream(): Promise<Buffer> {
    return this.client.downloadStreamMessage(this);
  }
}
