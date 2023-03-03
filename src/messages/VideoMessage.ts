import { IVideoMessage } from "@interfaces/IMessage";
import IChat from "@interfaces/IChat";

import MediaMessage from "@messages/MediaMessage";
import Message from "@messages/Message";

import { Bot } from "../types/Bot";


//@ts-ignore
export default class VideoMessage extends MediaMessage implements IVideoMessage {
  constructor(chat: IChat, text: string, video: Buffer, mention?: Message, id?: string) {
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
  public static Inject<MessageIn extends IVideoMessage>(bot: Bot, msg: MessageIn): MessageIn & VideoMessage {
    const module: VideoMessage = new VideoMessage(msg.chat, msg.text, msg.file);

    module.inject(bot, msg);

    return { ...msg, ...module };
  }
}
