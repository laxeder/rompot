import { IButtonMessage } from "@interfaces/Messages";
import { IChat } from "@interfaces/Chat";

import { Message } from "@messages/Message";

import { Button } from "../types/Message";

export default class ButtonMessage extends Message implements IButtonMessage {
  public buttons: Button[] = [];
  public footer: string;

  constructor(chat: IChat | string, text: string, footer: string = "") {
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
}
