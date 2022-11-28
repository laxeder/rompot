import { MediaMessage } from "@models/MediaMessage";
import { Message } from "@models/Message";
import { Chat } from "@models/Chat";

export class ImageMessage extends MediaMessage {
  private _image: Buffer | string;

  constructor(chat: Chat, text: string, _image: Buffer | string, mention?: Message, id?: string) {
    super(chat, text, mention, id);

    this._image = _image;
  }

  /**
   * * Define a imagem da mensagem
   * @param image
   */
  public setImage(image: Buffer | string) {
    this._image = image;
  }

  /**
   * * Obtem a imagem da mensagem
   * @returns
   */
  public async getImage() {
    return await this.getStream(this._image);
  }
}
