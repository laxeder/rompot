import { ListMessageInterface } from "@interfaces/MessagesInterfaces";
import ChatInterface from "@interfaces/ChatInterface";

import Message from "@messages/Message";

import { List, ListItem } from "../types/Message";
import { BotModule } from "../types/BotModule";

//@ts-ignore
export default class ListMessage extends Message implements ListMessageInterface {
  public list: List[] = [];
  public button: string;
  public title: string;
  public footer: string;

  constructor(chat: ChatInterface | string, text: string, buttonText: string, title?: string, footer?: string) {
    super(chat, text);

    this.button = buttonText;
    this.title = title || "";
    this.footer = footer || "";
  }

  addCategory(title: string, items: Array<ListItem> = []): number {
    const index = this.list.length;

    this.list.push({ title, items });

    return index;
  }

  addItem(index: number, title: string, description: string = "", id: string = this.generateID()) {
    return this.list[index].items.push({ title, description, id });
  }

  /**
   * @returns Retorna um ID
   */
  public generateID(): string {
    return String(Date.now());
  }

  /**
   * * Injeta a interface no modulo
   * @param bot Bot que irá executar os métodos
   * @param message Interface da mensagem
   */
  public static Inject<MessageIn extends ListMessageInterface>(bot: BotModule, msg: MessageIn): MessageIn & ListMessage {
    const module: ListMessage = new ListMessage(msg.chat, msg.text, msg.text);

    module.inject(bot, msg);

    return { ...msg, ...module };
  }
}
