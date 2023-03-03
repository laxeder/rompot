import { IListMessage } from "@interfaces/Messages";
import { IChat } from "@interfaces/Chat";

import Message from "@messages/Message";

import { List, ListItem } from "../types/Message";

export default class ListMessage extends Message implements IListMessage {
  public list: List[] = [];
  public button: string;
  public title: string;
  public footer: string;

  constructor(chat: IChat | string, text: string, buttonText: string, title?: string, footer?: string) {
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
}
