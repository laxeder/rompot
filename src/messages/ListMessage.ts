import { IChat, IListMessage, List, ListItem, MessageType } from "rompot-base";

import Message from "@messages/Message";

import { injectJSON } from "@utils/Generic";

export default class ListMessage extends Message implements IListMessage {
  public readonly type = MessageType.List;

  public list: List[] = [];
  public button: string;
  public footer: string;
  public title: string;

  constructor(chat: IChat | string, text: string, button: string, footer?: string, title?: string, others: Partial<ListMessage> = {}) {
    super(chat, text);

    this.button = button;
    this.footer = footer || "";
    this.title = title || "";

    injectJSON(others, this);
  }

  /**
   * * Adiciona uma seção
   * @param title Titulo da lista
   * @param items Items da lista
   * @returns Categoria criada
   */
  public addCategory(title: string, items: ListItem[] = []): number {
    const index = this.list.length;

    this.list.push({ title, items });

    return index;
  }

  /**
   * * Adiciona um item a lista
   * @param index Categoria do item
   * @param title Titulo do item
   * @param description Descrição do item
   * @param id ID do item
   */
  public addItem(index: number, title: string, description: string = "", id: string = String(Date.now())) {
    return this.list[index].items.push({ title, description, id });
  }
}
