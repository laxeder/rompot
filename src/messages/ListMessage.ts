import { IListMessage, IMessage } from "@interfaces/Messages";
import { IUser } from "@interfaces/User";
import { IChat } from "@interfaces/Chat";

import Message from "@messages/Message";

import { List, ListItem } from "../types/Message";

export default class ListMessage extends Message implements IListMessage {
  public button: string;
  public footer: string;
  public title: string;
  public list: List[] = [];

  constructor(
    chat: IChat | string,
    text: string,
    button: string,
    footer?: string,
    title?: string,
    mention?: IMessage,
    id?: string,
    user?: IUser | string,
    fromMe?: boolean,
    selected?: string,
    mentions?: string[],
    timestamp?: Number | Long
  ) {
    super(chat, text, mention, id, user, fromMe, selected, mentions, timestamp);

    this.button = button;
    this.footer = footer || "";
    this.title = title || "";
  }

  public addCategory(title: string, items: ListItem[] = []): number {
    const index = this.list.length;

    this.list.push({ title, items });

    return index;
  }

  public addItem(index: number, title: string, description: string = "", id: string = String(Date.now())) {
    return this.list[index].items.push({ title, description, id });
  }
}
