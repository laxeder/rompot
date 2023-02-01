import UserInterface from "@interfaces/UserInterface";

import BotBase from "@modules/BotBase";
import Chat from "@modules/Chat";

import { setBotProperty } from "@utils/bot";
import { getChatId } from "@utils/Marshal";

import { BotModule } from "../types/BotModule";
import { UserModule } from "../types/User";

export default class User implements UserModule {
  public id: string;
  public name: string;
  public description: string;
  public profile: Buffer;

  get bot(): BotModule {
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
    const chatId = getChatId(chat);

    const admins = await this.bot.getChatAdmins(chatId);

    return admins.hasOwnProperty(this.id);
  }

  public async IsLeader(chat: Chat | string): Promise<boolean> {
    const chatId = getChatId(chat);

    const leader = await this.bot.getChatLeader(chatId);

    return leader.id == this.id;
  }

  /**
   * * Injeta a interface no modulo
   * @param bot Bot que irá executar os métodos
   * @param user Interface do usuário
   */
  public static Inject<UserIn extends UserInterface>(bot: BotModule, user: UserIn): UserIn & UserModule {
    const userModule = new User(user.id, user.name, user.description, user.profile);

    setBotProperty(bot, userModule);

    return { ...user, ...userModule };
  }
}