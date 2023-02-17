import { MessageInterface } from "@interfaces/MessagesInterfaces";
import UserInterface from "@interfaces/UserInterface";
import ChatInterface from "@interfaces/ChatInterface";

import Message from "@messages/Message";

import BotBase from "@modules/BotBase";
import User from "@modules/User";

import { setBotProperty } from "@utils/bot";

import { ChatStatus, ChatType } from "../types/Chat";
import { BotModule } from "../types/Bot";
import { Users } from "../types/User";

export default class Chat implements ChatInterface {
  public id: string;
  public type: ChatType;
  public status: ChatStatus;
  public name: string;
  public description: string;
  public profile: Buffer;
  public users: Users;

  get bot(): BotModule {
    return new BotBase();
  }

  constructor(id: string, type?: ChatType, name?: string, description?: string, profile?: Buffer, users?: Users, status?: ChatStatus) {
    this.id = id;
    this.type = type || "pv";
    this.name = name || "";
    this.description = description || "";
    this.profile = profile || Buffer.from("");
    this.users = users || {};
    this.status = status || "offline";
  }

  public async setName(name: string): Promise<void> {
    this.name = name;

    await this.bot.setChatName(this, name);
  }

  public async getName(): Promise<string> {
    return this.bot.getChatName(this);
  }

  public async getDescription(): Promise<string> {
    return this.bot.getChatDescription(this);
  }

  public async setDescription(description: string): Promise<void> {
    this.description = description;

    return this.bot.setChatDescription(this, description);
  }

  public async getProfile(): Promise<Buffer> {
    return this.bot.getChatProfile(this);
  }

  public async setProfile(image: Buffer): Promise<void> {
    this.profile = image;

    return this.bot.setChatProfile(this, image);
  }

  public async IsAdmin(user: UserInterface | string): Promise<boolean> {
    const admins = await this.bot.getChatAdmins(this);

    return admins.hasOwnProperty(User.getUserId(user));
  }

  public async IsLeader(user: UserInterface | string): Promise<boolean> {
    const leader = await this.bot.getChatLeader(this);

    return leader.id == User.getUserId(user);
  }

  public async getAdmins(): Promise<Users> {
    return this.bot.getChatAdmins(this);
  }

  public async addUser(user: UserInterface | string): Promise<void> {
    return this.bot.addUserInChat(this, user);
  }

  public async removeUser(user: UserInterface | string): Promise<void> {
    return this.bot.removeUserInChat(this, user);
  }

  public async promote(user: UserInterface | string): Promise<void> {
    return this.bot.promoteUserInChat(this, user);
  }

  public async demote(user: UserInterface | string): Promise<void> {
    return this.bot.demoteUserInChat(this, user);
  }

  public async leave(): Promise<void> {
    return this.bot.leaveChat(this);
  }

  public async send(message: MessageInterface | string): Promise<Message> {
    return this.bot.send(Message.getMessage(message));
  }

  public changeStatus(status: ChatStatus): Promise<void> {
    return this.bot.changeChatStatus(this, status);
  }

  /**
   * @param chat Sala de bate-papo que será obtida
   * @returns Retorna a sala de bate-papo
   */
  public static getChat<ChatIn extends ChatInterface>(chat: ChatIn | string): ChatIn | ChatInterface {
    if (typeof chat == "string") {
      return new Chat(chat);
    }

    return chat;
  }

  /**
   * @param chat Sala de bate-papo
   * @returns Retorna o ID da sala de bate-papo
   */
  public static getChatId(chat: ChatInterface | string): string {
    if (typeof chat == "string") {
      return String(chat || "");
    }

    if (typeof chat == "object" && !Array.isArray(chat) && chat?.id) {
      return String(chat.id);
    }

    return String(chat || "");
  }

  /**
   * * Injeta a interface no modulo
   * @param bot Bot que irá executar os métodos
   * @param chat Interface da sala de bate-papo
   */
  public static Inject<ChatIn extends ChatInterface>(bot: BotModule, chat: ChatIn): ChatIn & Chat {
    const module: Chat = new Chat(chat.id, chat.type, chat.name, chat.description, chat.profile);

    for (const id in chat.users) {
      const user = chat.users[id];

      if (!(user instanceof User)) {
        module.users[id] = User.Inject(bot, chat.users[id]);
      } else {
        module.users[id] = user;
      }
    }

    setBotProperty(bot, module);

    return { ...chat, ...module };
  }
}
