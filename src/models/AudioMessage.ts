import { MediaMessage } from "@models/MediaMessage";
import { Message } from "@models/Message";
import { Chat } from "@models/Chat";

export class AudioMessage extends MediaMessage {
  constructor(chat: Chat, text: string, audio: any, mention?: Message, id?: string) {
    super(chat, text, mention, id);

    this.setAudio(audio);
  }
}
