import { MessageInterface } from "@interfaces/MessagesInterfaces";
import ChatInterface from "@interfaces/ChatInterface";

import BotBase from "@modules/BotBase";
import Chat from "@modules/Chat";
import User from "@modules/User";

import { getChat, getMessage } from "@utils/Marshal";
import { setBotProperty } from "@utils/bot";

import { MessageModule } from "../types/Messages";
import { BotModule } from "../types/BotModule";
import MediaMessage from "./MediaMessage";

export default class Message implements MessageModule {
  public id: string;
  public chat: Chat;
  public user: User;
  public text: string;
  public fromMe: boolean;
  public mentions: string[];
  public mention?: Message;
  public timestamp: Number | Long;

  get bot(): BotModule {
    return new BotBase();
  }

  constructor(chat: ChatInterface | string, text: string, mention?: MessageInterface, id?: string) {
    this.chat = Chat.Inject(this.bot, getChat(chat));

    this.id = id || String(Date.now());
    this.user = new User(this.bot.id);
    this.text = text;
    this.fromMe = true;
    this.mentions = [];

    if (mention) {
      this.mention = Message.Inject(this.bot, mention);
    } else {
      this.mention = mention;
    }

    this.timestamp = Date.now();
  }

  public async addReaction(reaction: string): Promise<void> {
    return this.bot.addReaction(this, reaction);
  }

  public async send(message: MessageInterface | string): Promise<Message> {
    return this.bot.send(getMessage(message));
  }

  public async reply(message: MessageInterface | string, mention: boolean = true): Promise<Message> {
    const msg = getMessage(message);

    if (mention) msg.mention = this;

    return this.bot.send(msg);
  }

  public async read(): Promise<void> {
    return this.bot.readMessage(this);
  }

  public inject<MessageIn extends MessageInterface>(bot: BotModule, msg: MessageIn): void {
    this.id = msg.id;
    this.text = msg.text;
    this.fromMe = msg.fromMe;
    this.mentions = msg.mentions;
    this.timestamp = msg.timestamp;

    this.chat = Chat.Inject(bot, msg.chat);
    this.user = User.Inject(bot, msg.user);

    if (msg.mention) {
      this.mention = Message.Inject(bot, msg.mention);
    }

    if (msg instanceof MediaMessage && this instanceof MediaMessage) {
      this.getStream = msg.getStream;
    }

    setBotProperty(bot, this);
    setBotProperty(bot, this.chat);
    setBotProperty(bot, this.user);
  }

  /**
   * * Injeta a interface no modulo
   * @param bot Bot que irá executar os métodos
   * @param message Interface da mensagem
   */
  public static Inject<MessageIn extends MessageInterface>(bot: BotModule, msg: MessageIn): MessageIn & Message {
    const module: Message = new Message(msg.chat, msg.text);

    module.inject(bot, msg);

    return { ...msg, ...module };
  }
}
