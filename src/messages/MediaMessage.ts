import { MediaMessageInterface } from "@interfaces/MessagesInterfaces";
import ChatInterface from "@interfaces/ChatInterface";

import Message from "@messages/Message";

import { BotModule } from "../types/Bot";

//@ts-ignore
export default class MediaMessage extends Message implements MediaMessageInterface {
  public isGIF: boolean = false;
  public file: any;

  constructor(chat: ChatInterface | string, text: string, file: any, mention?: Message, id?: string) {
    super(chat, text, mention, id);

    this.file = file || Buffer.from(String(file || ""));
  }

  public async getStream(stream: any): Promise<Buffer> {
    if (Buffer.isBuffer(stream)) return stream;

    return Buffer.from(String(stream || ""));
  }

  /**
   * * Injeta a interface no modulo
   * @param bot Bot que irá executar os métodos
   * @param message Interface da mensagem
   */
  public static Inject<MessageIn extends MediaMessageInterface>(bot: BotModule, msg: MessageIn): MessageIn & MediaMessage {
    const module: MediaMessage = new MediaMessage(msg.chat, msg.text, msg.file);

    module.inject(bot, msg);

    return { ...msg, ...module };
  }
}
