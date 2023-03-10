import Message from "@messages/Message";

import Chat from "@modules/Chat";
import User from "@modules/User";

import { Button } from "../types/Message";

export default class ButtonMessage extends Message {
  /** * Rodapé */
  public footer: string;
  /** * Botões */
  public buttons: Button[] = [];

  constructor(
    chat: Chat | string,
    text: string,
    footer?: string,
    mention?: Message,
    id?: string,
    user?: User | string,
    fromMe?: boolean,
    selected?: string,
    mentions?: string[],
    timestamp?: Number | Long
  ) {
    super(chat, text, mention, id, user, fromMe, selected, mentions, timestamp);

    this.footer = footer || "";
  }

  /**
   * * Adiciona um botão com uma url
   * @param text Texto da botão
   * @param url Url do botão
   * @param index Posição do botão
   */
  public addUrl(text: string, url: string, index: number = this.buttons.length + 1) {
    this.buttons.push({ index, type: "url", text, content: url });
  }

  /**
   * * Adiciona um botão com um telefone
   * @param text Texto do botão
   * @param phone Tefefone do botão
   * @param index Posição do botão
   */
  public addCall(text: string, phone: string, index: number = this.buttons.length + 1) {
    this.buttons.push({ index, type: "call", text, content: phone });
  }

  /**
   * * Adiciona um botão respondivel
   * @param text Texto do botão
   * @param id ID do botão
   * @param index Posição do botão
   */
  public addReply(text: string, id: string = String(this.buttons.length + 1), index: number = this.buttons.length + 1) {
    this.buttons.push({ index, type: "reply", text, content: id });
  }

  /**
   * * Remove um botão
   * @param index Posição do botão
   */
  public remove(index: number) {
    this.buttons.splice(index);
  }
}
