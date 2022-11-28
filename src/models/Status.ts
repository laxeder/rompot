import { StatusOptions } from "../types/Status";
import { Chat } from "@models/Chat";
import { Message } from "@models/Message";

export class Status {
  public status: keyof StatusOptions;
  public chat?: Chat;
  public message?: Message;

  constructor(status: keyof StatusOptions, chat?: Chat, message?: Message) {
    this.message = message;
    this.status = status;
    this.chat = chat;
  }

  /**
   * * Define o status
   * @param status
   */
  public setStatus(status: keyof StatusOptions) {
    this.status = status;
  }

  /**
   * * Define a sala de bate-papo que está com o status
   * @param chat
   */
  public setChat(chat: Chat) {
    this.chat = chat;
  }

  /**
   * * Define a mensagem que está com esse status
   * @param message
   */
  public setMessage(message: Message) {
    this.message = message;
  }

  /**
   * * Retorna o status
   * @returns
   */
  public getStatus(): string {
    return this.status;
  }

  /**
   * * retorna a sala de bate-papo que está com o status
   * @returns
   */
  public getChat(): Chat | undefined {
    return this.chat;
  }

  /**
   * *  Retorna a mensagem que está com esse status
   * @returns
   */
  public getMessage(): Message | undefined {
    return this.message;
  }
}
