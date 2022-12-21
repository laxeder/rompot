import { Bot } from "@models/Bot";

var bot: Bot;

export class User {
  public id: string = "";
  public name: string;
  public isAdmin: boolean = false;
  public isLeader: boolean = false;

  constructor(id: string, name: string = "", isAdmin: boolean = false, isLeader: boolean = false) {
    this.id = id;
    this.name = name;
    this.isAdmin = isAdmin;
    this.isLeader = isLeader;
  }

  /**
   * * Define o bot do usuário
   * @param bot
   */
  public setBot(bot: Bot) {
    bot = bot;
  }

  /**
   * * Retorna o bot do usuário
   * @returns
   */
  public getBot(): Bot {
    return bot;
  }

  /**
   * * Bloqueia o usuário
   */
  public async blockUser(): Promise<any> {
    return await bot?.blockUser(this);
  }

  /**
   * * Desbloqueia o usuário
   */
  public async unblockUser(): Promise<any> {
    return await bot?.unblockUser(this);
  }

  /**
   * * Retorna a imagem do usuário
   * @returns
   */
  public async getProfile(): Promise<any> {
    return await bot?.getProfile(this);
  }

  /**
   * * Retorna a descrição do usuário
   * @returns
   */
  public async getDescription(): Promise<any> {
    return await bot?.getDescription(this);
  }

  /**
   * * Verifica se o usuário tem permissão
   * @param userPermissions
   * @param commandPermissions
   * @param ignore
   * @returns
   */
  public checkPermissions(userPermissions: string[], commandPermissions: string[], ignore: string[] = []): boolean {
    if (commandPermissions.length <= 0) return true;

    commandPermissions = commandPermissions.filter((p: string) => {
      if (ignore.includes(p)) return true;
      return userPermissions.indexOf(p) > -1;
    });

    return commandPermissions.length <= 0;
  }
}
