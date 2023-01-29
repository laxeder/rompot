import { MediaMessage } from "@messages/MediaMessage";
import { Message } from "@messages/Message";
import { Chat } from "@modules/Chat";

export class AudioMessage extends MediaMessage {
  constructor(chat: Chat, text: string, audio: any, mention?: Message, id?: string) {
    super(chat, text, mention, id);

    this.setAudio(audio);
  }
}
