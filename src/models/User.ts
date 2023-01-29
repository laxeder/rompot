import { getChatId } from "@utils/getChat";
import { BotModule } from "../types/Bot";
import { Chat } from "@models/Chat";

export interface UserInterface {
  /**
   * * ID do usuário
   */
  id: string;

  /**
   * * Bloqueia o usuário
   */
  blockUser(): Promise<void>;

  /**
   * * Desbloqueia o usuário
   */
  unblockUser(): Promise<void>;

  /**
   * @returns Retorna o nome do usuário
   */
  getName(): Promise<string>;

  /**
   * @returns Retorna a descrição do usuário
   */
  getDescription(): Promise<string>;

  /**
   * @returns Retorna a imagem de perfil do usuário
   */
  getProfile(): Promise<Buffer>;

  /**
   * @param chat Sala de bate-papo que está o usuário
   * @returns Retorna se o usuário é administrador daquela sala de bate-papo
   */
  IsAdmin(chat: Chat | string): Promise<boolean>;

  /**
   * @param chat Sala de bate-papo que está o usuário
   * @returns Retorna se o usuário é lider daquela sala de bate-papo
   */
  IsLeader(chat: Chat | string): Promise<boolean>;
}

export class User implements UserInterface {
  public id: string;

  constructor(bot: BotModule, id: string) {
    this.id = id;

    this.blockUser = () => {
      return bot.blockUser(this.id);
    };

    this.unblockUser = () => {
      return bot.unblockUser(this.id);
    };

    this.getName = () => {
      return bot.getUserName(this.id);
    };

    this.getDescription = () => {
      return bot.getUserDescription(this.id);
    };

    this.getProfile = () => {
      return bot.getUserProfile(this.id);
    };

    //TODO: implementar check admin/leader

    this.IsAdmin = async (chat: Chat | string) => {
      const chatId = getChatId(chat);

      return false;
    };

    this.IsLeader = async (chat: Chat | string) => {
      const chatId = getChatId(chat);

      return false;
    };
  }

  public async blockUser(): Promise<void> {}

  public async unblockUser(): Promise<void> {}

  public async getName(): Promise<string> {
    return "";
  }

  public async getDescription(): Promise<string> {
    return "";
  }

  public async getProfile(): Promise<Buffer> {
    return Buffer.from("");
  }

  public async IsAdmin(chat: Chat | string): Promise<boolean> {
    return false;
  }

  public async IsLeader(chat: Chat | string): Promise<boolean> {
    return false;
  }
}
