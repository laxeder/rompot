import { MediaMessage } from "@models/MediaMessage";
import { Message } from "@models/Message";
import { Chat } from "@models/Chat";

export class ImageMessage extends MediaMessage {
  constructor(chat: Chat, text: string, image: any, mention?: Message, id?: string) {
    super(chat, text, mention, id);

    this.setImage(image);
  }
}
