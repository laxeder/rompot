import { VideoMessageInterface } from "@interfaces/MessagesInterfaces";
import ChatInterface from "@interfaces/ChatInterface";

import MediaMessage from "@messages/MediaMessage";
import Message from "@messages/Message";

import { BotModule } from "../types/BotModule";

//@ts-ignore
export default class VideoMessage extends MediaMessage implements VideoMessageInterface {
  constructor(chat: ChatInterface, text: string, video: Buffer, mention?: Message, id?: string) {
    super(chat, text, video, mention, id);
  }

  public async getVideo(): Promise<Buffer> {
    return this.getStream(this.file);
  }

  /**
   * * Injeta a interface no modulo
   * @param bot Bot que irá executar os métodos
   * @param message Interface da mensagem
   */
  public static Inject<MessageIn extends VideoMessageInterface>(bot: BotModule, msg: MessageIn): MessageIn & VideoMessage {
    const module: VideoMessage = new VideoMessage(msg.chat, msg.text, msg.file);

    module.inject(bot, msg);

    return { ...msg, ...module };
  }
}
