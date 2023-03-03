import { IAudioMessage } from "@interfaces/IMessage";
import IChat from "@interfaces/IChat";

import MediaMessage from "@messages/MediaMessage";
import Message from "@messages/Message";

import { Bot } from "../types/Bot";

//@ts-ignore
export default class AudioMessage extends MediaMessage implements IAudioMessage {
  constructor(chat: IChat, audio: Buffer, mention?: Message, id?: string) {
    super(chat, "", audio, mention, id);
  }

  public async getAudio(): Promise<Buffer> {
    return this.getStream(this.file);
  }

  /**
   * * Injeta a interface no modulo
   * @param bot Bot que irá executar os métodos
   * @param message Interface da mensagem
   */
  public static Inject<MessageIn extends IAudioMessage>(bot: Bot, msg: MessageIn): MessageIn & AudioMessage {
    const module: AudioMessage = new AudioMessage(msg.chat, msg.file);

    module.inject(bot, msg);

    return { ...msg, ...module };
  }
}
