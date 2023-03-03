import { IMessage } from "@interfaces/Messages";
import { IChat } from "@interfaces/Chat";

import Chat, { GenerateChat } from "@modules/Chat";
import User from "@modules/User";
import BotBase from "@modules/BotBase";

import { Bot } from "../types/Bot";

export default class Message implements IMessage {
  public id: string;
  public chat: Chat;
  public user: User;
  public text: string;
  public fromMe: boolean;
  public selected: string;
  public mentions: string[];
  public mention?: Message;
  public timestamp: Number | Long;

  get bot(): Bot {
    return new BotBase();
  }

  constructor(chat: IChat | string, text: string, mention?: IMessage, id?: string) {
    this.chat = GenerateChat(this.bot, Chat.getChat(chat));

    this.id = id || String(Date.now());
    this.user = new User(this.bot.id);
    this.text = text;
    this.fromMe = true;
    this.selected = "";
    this.mentions = [];

    if (mention) {
      //@ts-ignore
      this.mention = GenerateMessage(this.bot, mention);
    } else {
      this.mention = mention;
    }

    this.timestamp = Date.now();
  }

  public async addReaction(reaction: string): Promise<void> {
    return this.bot.addReaction(this, reaction);
  }

  public async reply(message: IMessage | string, mention: boolean = true): Promise<Message> {
    const msg = Message.getMessage(message);

    if (mention) msg.mention = this;

    return this.bot.send(msg);
  }

  public async read(): Promise<void> {
    return this.bot.readMessage(this);
  }

  /**
   * @param message Mensagem que será obtida
   * @returns Retorna a mensagem
   */
  public static getMessage<MessageIn extends IMessage>(message: MessageIn | string): MessageIn | IMessage {
    if (typeof message == "string") {
      return new Message(new Chat(""), message);
    }

    return message;
  }

  /**
   * @param message Mensagem
   * @returns Retorna o ID da mensagem
   */
  public static getMessageId(message: IMessage | string): string {
    if (typeof message == "string") {
      return String(message || "");
    }

    if (typeof message == "object" && !Array.isArray(message) && message?.id) {
      return String(message.id);
    }

    return String(message || "");
  }
}
