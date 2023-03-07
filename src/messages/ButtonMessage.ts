import { IButtonMessage, IMessage } from "@interfaces/Messages";
import { IUser } from "@interfaces/User";
import { IChat } from "@interfaces/Chat";

import Message from "@messages/Message";

import { Button } from "../types/Message";

export default class ButtonMessage extends Message implements IButtonMessage {
  public footer: string;
  public buttons: Button[] = [];

  constructor(
    chat: IChat | string,
    text: string,
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

    this.footer = footer || "";
  }

  public addUrl(text: string, url: string, index: number = this.buttons.length + 1) {
    this.buttons.push({ index, type: "url", text, content: url });
  }

  public addCall(text: string, phone: string, index: number = this.buttons.length + 1) {
    this.buttons.push({ index, type: "call", text, content: phone });
  }

  public addReply(text: string, id: string = String(this.buttons.length + 1), index: number = this.buttons.length + 1) {
    this.buttons.push({ index, type: "reply", text, content: id });
  }

  public remove(index: number) {
    this.buttons.splice(index);
  }
}
