import type { Button } from "../types/Message";

import { MessageType } from "@enums/Message";

import Message from "@messages/Message";

import Chat from "@modules/Chat";

import { injectJSON } from "@utils/Generic";

export default class ButtonMessage extends Message {
  public type: MessageType.Button | MessageType.TemplateButton = MessageType.TemplateButton;

  /** * Rodapé */
  public footer: string;
  /** * Botões */
  public buttons: Button[] = [];
  /** * Tipo do botões */

  constructor(chat: Chat | string, text: string, footer?: string, others: Partial<ButtonMessage> = {}) {
    super(chat, text);

    this.footer = footer || "";

    injectJSON(others, this);
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
