import { Message } from "@models/Message";
import { Chat } from "@models/Chat";

export class ImageMessage extends Message {
  public image: Buffer | string;

  constructor(chat: Chat, text: string, image: Buffer | string, mention?: Message, id?: string) {
    super(chat, text, mention, id);

    this.image = image;
  }

  public setImage(image: Buffer | string) {
    this.image = image;
  }

  public getImage() {
    return this.image;
  }
}
