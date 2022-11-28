import { Message } from "@models/Message";
import { Chat } from "@models/Chat";

export class MediaMessage extends Message {
  private _getStream?: Function;

  constructor(chat: Chat, text: string, mention?: Message, id?: string) {
    super(chat, text, mention, id);
  }

  /**
   * * Define o meio de leitura da midia da mensagem
   * @param fnStream
   */
  public setSream(fnStream: Function) {
    this._getStream = fnStream;
  }

  /**
   * * Obtem a midia da mensagem
   * @param stream
   * @returns
   */
  public async getStream(stream: any) {
    //TODO: Obter base64
    if (stream instanceof Buffer) return stream;
    if (this._getStream) return await this._getStream(stream);
    return Buffer.from("");
  }
}
