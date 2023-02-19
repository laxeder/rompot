import { AudioMessageInterface, ImageMessageInterface } from "@interfaces/MessagesInterfaces";
import ChatInterface from "@interfaces/ChatInterface";

import MediaMessage from "@messages/MediaMessage";
import Message from "@messages/Message";

import { BotModule } from "../types/Bot";

//@ts-ignore
export default class AudioMessage extends MediaMessage implements ImageMessageInterface {
  constructor(chat: ChatInterface, text: string, audio: Buffer, mention?: Message, id?: string) {
    super(chat, text, audio, mention, id);
  }

  public async getAudio(): Promise<Buffer> {
    return this.getStream(this.file);
  }

  /**
   * * Injeta a interface no modulo
   * @param bot Bot que irá executar os métodos
   * @param message Interface da mensagem
   */
  public static Inject<MessageIn extends AudioMessageInterface>(bot: BotModule, msg: MessageIn): MessageIn & AudioMessage {
    const module: AudioMessage = new AudioMessage(msg.chat, msg.text, msg.file);

    module.inject(bot, msg);

    return { ...msg, ...module };
  }
}
