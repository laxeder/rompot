import { IVideoMessage } from "@interfaces/Messages";
import { IChat } from "@interfaces/Chat";

import MediaMessage from "@messages/MediaMessage";
import Message from "@messages/Message";

export default class VideoMessage extends MediaMessage implements IVideoMessage {
  constructor(chat: IChat, text: string, video: Buffer, mention?: Message, id?: string) {
    super(chat, text, video, mention, id);
  }

  public async getVideo(): Promise<Buffer> {
    return this.getStream(this.file);
  }
}
