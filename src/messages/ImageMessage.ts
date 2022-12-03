import { MediaMessage } from "@messages/MediaMessage";
import { Message } from "@messages/Message";
import { Chat } from "@models/Chat";

export class ImageMessage extends MediaMessage {
  constructor(chat: Chat, text: string, image: any, mention?: Message, id?: string) {
    super(chat, text, mention, id);

    this.setImage(image);
  }
}
