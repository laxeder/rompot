import { List, ListItem } from "../types/List";
import { Message } from "@messages/Message";
import { Chat } from "@models/Chat";

export class ListMessage extends Message {
  public list: Array<List> = [];
  public buttonText: string;
  public footer: string;
  public title: string;
  public add?: Function;

  constructor(chat: Chat, title: string, text: string, footer: string, buttonText: string) {
    super(chat, text);

    this.title = title;
    this.text = text;
    this.footer = footer;
    this.buttonText = buttonText;
  }

  /**
   * * Adiciona uma seção
   * @param title
   * @param items
   * @returns
   */
  addCategory(title: string, items: Array<ListItem> = []): number {
    const index = this.list.length;

    this.list.push({ title, items });

    return index;
  }

  /**
   * * Adiciona um item a lista
   * @param index
   * @param title
   * @param description
   * @param id
   * @returns
   */
  addItem(index: number, title: string, description: string = "", id: string = this.generateID()) {
    return this.list[index].items.push({ title, description, id });
  }

  /**
   * * Gera um novo ID
   * @returns
   */
  public generateID(): string {
    return String(Date.now());
  }
}
