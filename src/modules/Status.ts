import { StatusTypes } from "../types/Status";
import { Message } from "@messages/Message";
import { Chat } from "@modules/Chat";

export class Status {
  public status: StatusTypes;
  public message?: Message;
  public chat?: Chat;

  constructor(status: StatusTypes, chat?: Chat, message?: Message) {
    this.message = message;
    this.status = status;
    this.chat = chat;
  }

  /**
   * * Define a sala de bate-papo que está com o status
   * @param chat
   */
  public setChat(chat: Chat | string) {
    if (!(chat instanceof Chat)) chat = new Chat(`${chat}`);

    this.chat = chat;
  }
}
