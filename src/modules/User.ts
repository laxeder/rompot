import UserInterface from "@interfaces/UserInterface";
import { BotModule } from "../types/BotModule";
import { getChatId } from "@utils/getChat";
import { Chat } from "@modules/Chat";
import BotBase from "./BotBase";

export default class UserModule implements UserInterface {
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

  /**
   * * Bloqueia o usuário
   */
  public async blockUser(): Promise<void> {
    return this.bot.blockUser(this.id);
  }

  /**
   * * Desbloqueia o usuário
   */
  public async unblockUser(): Promise<void> {
    return this.bot.unblockUser(this.id);
  }

  /**
   * @returns Retorna o nome do usuário
   */
  public async getName(): Promise<string> {
    return this.bot.getUserName(this.id);
  }

  /**
   * @returns Retorna a descrição do usuário
   */
  public async getDescription(): Promise<string> {
    return this.bot.getUserDescription(this.id);
  }

  /**
   * @returns Retorna a imagem de perfil do usuário
   */
  public async getProfile(): Promise<Buffer> {
    return this.bot.getUserProfile(this.id);
  }

  /**
   * @param chat Sala de bate-papo que está o usuário
   * @returns Retorna se o usuário é administrador daquela sala de bate-papo
   */
  public async IsAdmin(chat: Chat | string): Promise<boolean> {
    const chatId = getChatId(chat);

    const admins = await this.bot.getChatAdmins(chatId);

    let isAdmin = false;

    for (const admin of admins) {
      if (admin.id == this.id) {
        isAdmin = true;
        break;
      }
    }

    return isAdmin;
  }

  /**
   * @param chat Sala de bate-papo que está o usuário
   * @returns Retorna se o usuário é lider daquela sala de bate-papo
   */
  public async IsLeader(chat: Chat | string): Promise<boolean> {
    const chatId = getChatId(chat);

    const leader = await this.bot.getChatLeader(chatId);

    return leader.id == this.id;
  }
}
