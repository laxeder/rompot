import { ButtonMessageInterface } from "@interfaces/MessagesInterfaces";
import ChatInterface from "@interfaces/ChatInterface";

import Message from "@messages/Message";

import { Bot } from "../types/Bot";

import { Button } from "../types/Message";

//@ts-ignore
export default class ButtonMessage extends Message implements ButtonMessageInterface {
  public buttons: Button[] = [];
  public footer: string;

  constructor(chat: ChatInterface | string, text: string, footer: string = "") {
    super(chat, text);

    this.footer = footer;
  }

  public addUrl(text: string, url: string, index: number = this.buttons.length + 1) {
    this.buttons.push({ index, type: "url", text, content: url });
  }

  public addCall(text: string, phone: string, index: number = this.buttons.length + 1) {
    this.buttons.push({ index, type: "call", text, content: phone });
  }

  public addReply(text: string, id: string = this.generateID(), index: number = this.buttons.length + 1) {
    this.buttons.push({ index, type: "reply", text, content: id });
  }

  public remove(index: number) {
    this.buttons.splice(index);
  }

  public generateID(): string {
    return String(this.buttons.length + 1);
  }

  /**
   * * Injeta a interface no modulo
   * @param bot Bot que irá executar os métodos
   * @param message Interface da mensagem
   */
  public static Inject<MessageIn extends ButtonMessageInterface>(bot: Bot, msg: MessageIn): MessageIn & ButtonMessage {
    const module: ButtonMessage = new ButtonMessage(msg.chat, msg.text);

    module.inject(bot, msg);

    module.footer = msg.footer;
    module.buttons = msg.buttons;

    return { ...msg, ...module };
  }
}
