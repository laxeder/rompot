import { MediaMessage } from "@buttons/MediaMessage";
import { Message } from "@buttons/Message";
import { Chat } from "@models/Chat";

export class AudioMessage extends MediaMessage {
  constructor(chat: Chat, text: string, audio: any, mention?: Message, id?: string) {
    super(chat, text, mention, id);

    this.setAudio(audio);
  }
}
