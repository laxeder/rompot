import { LocationMessageInterface } from "@interfaces/MessagesInterfaces";
import ChatInterface from "@interfaces/ChatInterface";

import Message from "@messages/Message";

import { Bot } from "../types/Bot";


//@ts-ignore
export default class LocationMessage extends Message implements LocationMessageInterface {
  public latitude: number;
  public longitude: number;

  constructor(chat: ChatInterface | string, latitude: number, longitude: number, mention?: Message, id?: string) {
    super(chat, "", mention, id);

    this.latitude = latitude;
    this.longitude = longitude;
  }

  public setLocation(latitude: number, longitude: number) {
    this.latitude = latitude;
    this.longitude = longitude;
  }

  /**
   * * Injeta a interface no modulo
   * @param bot Bot que irá executar os métodos
   * @param message Interface da mensagem
   */
  public static Inject<MessageIn extends LocationMessageInterface>(bot: Bot, msg: MessageIn): MessageIn & LocationMessage {
    const module: LocationMessage = new LocationMessage(msg.chat, msg.latitude, msg.longitude);

    module.inject(bot, msg);

    return { ...msg, ...module };
  }
}
