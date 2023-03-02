import { ImageMessageInterface } from "@interfaces/MessagesInterfaces";
import ChatInterface from "@interfaces/ChatInterface";

import MediaMessage from "@messages/MediaMessage";
import Message from "@messages/Message";

import { Bot } from "../types/Bot";


//@ts-ignore
export default class ImageMessage extends MediaMessage implements ImageMessageInterface {
  constructor(chat: ChatInterface, text: string, image: Buffer, mention?: Message, id?: string) {
    super(chat, text, image, mention, id);
  }

  public async getImage(): Promise<Buffer> {
    return this.getStream(this.file);
  }

  /**
   * * Injeta a interface no modulo
   * @param bot Bot que irá executar os métodos
   * @param message Interface da mensagem
   */
  public static Inject<MessageIn extends ImageMessageInterface>(bot: Bot, msg: MessageIn): MessageIn & ImageMessage {
    const module: ImageMessage = new ImageMessage(msg.chat, msg.text, msg.file);

    module.inject(bot, msg);

    return { ...msg, ...module };
  }
}
