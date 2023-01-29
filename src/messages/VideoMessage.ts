import { MediaMessage } from "@messages/MediaMessage";
import { Message } from "@messages/Message";
import { Chat } from "@modules/Chat";

export class VideoMessage extends MediaMessage {
  constructor(chat: Chat, text: string, video: any, mention?: Message, id?: string) {
    super(chat, text, mention, id);

    this.setVideo(video);
  }
}
