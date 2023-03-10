import Message from "@messages/Message";

import Chat from "@modules/Chat";
import User from "@modules/User";

import { List, ListItem } from "../types/Message";

export default class ListMessage extends Message {
  /** * Botão */
  public button: string;
  /** * Rodapé */
  public footer: string;
  /** * Titulo */
  public title: string;
  /** * Lista */
  public list: List[] = [];

  constructor(
    chat: Chat | string,
    text: string,
    button: string,
    footer?: string,
    title?: string,
    mention?: Message,
    id?: string,
    user?: User | string,
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
