import { IAudioMessage } from "@interfaces/Messages";
import { IChat } from "@interfaces/Chat";

import MediaMessage from "@messages/MediaMessage";
import Message from "@messages/Message";

export default class AudioMessage extends MediaMessage implements IAudioMessage {
  constructor(chat: IChat, audio: Buffer, mention?: Message, id?: string) {
    super(chat, "", audio, mention, id);
  }

  public async getAudio(): Promise<Buffer> {
    return this.getStream(this.file);
  }
}
