import { Message } from "@models/Message";
import { Chat } from "@models/Chat";

export class ImageMessage extends Message {
  public image: Buffer | string;

  constructor(chat: Chat, text: string, image: Buffer | string, mention?: Message, id?: string) {
    super(chat, text, mention, id);

    this.image = image;
  }

  /**
   * * Define a imagem da mensagem
   * @param image
   */
  public setImage(image: Buffer | string) {
    this.image = image;
  }

  /**
   * * Obtem a imagem da mensagem
   * @returns
   */
  public getImage() {
    return this.image;
  }
}
