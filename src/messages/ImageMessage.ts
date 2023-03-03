import { IImageMessage } from "@interfaces/Messages";
import { IChat } from "@interfaces/Chat";

import MediaMessage from "@messages/MediaMessage";
import Message from "@messages/Message";

export default class ImageMessage extends MediaMessage implements IImageMessage {
  constructor(chat: IChat, text: string, image: Buffer, mention?: Message, id?: string) {
    super(chat, text, image, mention, id);
  }

  public async getImage(): Promise<Buffer> {
    return this.getStream(this.file);
  }
}
