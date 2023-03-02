import UserInterface from "@interfaces/UserInterface";

import BotBase from "@modules/BotBase";
import Chat from "@modules/Chat";

import { setBotProperty } from "@utils/bot";

import { Bot } from "../types/Bot";


export default class User implements UserInterface {
  public id: string;
  public name: string;
  public description: string;
  public profile: Buffer;

  get bot(): Bot {
    return new BotBase();
  }

  constructor(id: string, name?: string, description?: string, profile?: Buffer) {
    this.id = id;
    this.name = name || "";
    this.description = description || "";
    this.profile = profile || Buffer.from("");
  }

  public async blockUser(): Promise<void> {
    return this.bot.blockUser(this);
  }

  public async unblockUser(): Promise<void> {
    return this.bot.unblockUser(this);
  }

  public async getName(): Promise<string> {
    return this.bot.getUserName(this);
  }

  public async setName(name: string): Promise<void> {
    return this.bot.setUserName(this, name);
  }

  public async getDescription(): Promise<string> {
    return this.bot.getUserDescription(this);
  }

  public async setDescription(description: string): Promise<void> {
    return this.bot.setUserDescription(this, description);
  }

  public async getProfile(): Promise<Buffer> {
    return this.bot.getUserProfile(this);
  }

  public async setProfile(image: Buffer): Promise<void> {
    return this.bot.setUserProfile(this, image);
  }

  public async IsAdmin(chat: Chat | string): Promise<boolean> {
    const chatId = Chat.getChatId(chat);

    const admins = await this.bot.getChatAdmins(chatId);

    return admins.hasOwnProperty(this.id);
  }

  public async IsLeader(chat: Chat | string): Promise<boolean> {
    const chatId = Chat.getChatId(chat);

    const leader = await this.bot.getChatLeader(chatId);

    return leader.id == this.id;
  }

  /**
   * @param user Usuário que será obtido
   * @returns Retorna o usuário
   */
  public static getUser<UserIn extends UserInterface>(user: UserIn | string): UserIn | UserInterface {
    if (typeof user == "string") {
      return new User(user);
    }

    return user;
  }

  /**
   * @param user Usuário
   * @returns Retorna o ID do usuário
   */
  public static getUserId(user: UserInterface | string) {
    if (typeof user == "string") {
      return String(user || "");
    }

    if (typeof user == "object" && !Array.isArray(user) && user?.id) {
      return String(user.id);
    }

    return String(user || "");
  }

  /**
   * * Injeta a interface no modulo
   * @param bot Bot que irá executar os métodos
   * @param user Interface do usuário
   */
  public static Inject<UserIn extends UserInterface>(bot: Bot, user: UserIn): UserIn & UserInterface {
    const userModule = new User(user.id, user.name, user.description, user.profile);

    setBotProperty(bot, userModule);

    return { ...user, ...userModule };
  }
}
