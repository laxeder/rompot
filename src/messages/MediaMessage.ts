import Message from "@messages/Message";

import Chat from "@modules/Chat";
import User from "@modules/User";

export default class MediaMessage extends Message {
  /** * Arquivo da mensagem */
  public file: any | Buffer;
  /** * O arquivo é um GIF */
  public isGIF: boolean = false;

  constructor(chat: Chat | string, text: string, file: any, mention?: Message, id?: string, user?: User | string, fromMe?: boolean, selected?: string, mentions?: string[], timestamp?: Number | Long) {
    super(chat, text, mention, id, user, fromMe, selected, mentions, timestamp);

    this.file = file;
  }

  /**
   * @returns Obter arquivo
   */
  public async getStream(stream?: any): Promise<Buffer> {
    return stream || this.file;
  }
}
