import { ChatTypes } from "../types/Chat";
import { User } from "@models/User";
import { Bot } from "@models/Bot";

var bot: Bot;

export class Chat {
  public id: string;
  public name: string;
  public description: string;
  public type: ChatTypes;
  public members: { [key: string]: User } = {};

  constructor(id: string, name?: string, description?: string, type?: ChatTypes) {
    this.id = id;
    this.name = name || "";
    this.description = description || "";
    this.type = type || "pv";
  }

  /**
   * * Define o nome da sala de bate-papo
   * @param name
   */
  public async setName(name: string) {
    this.name = name;

    await bot?.setChatName(this, name);
  }

  /**
   * * Define a descrição da sala de bate-papo
   * @param desc
   */
  public async setDescription(desc: string) {
    this.description = this.description;

    await bot?.setDescription(desc, this);
  }

  /**
   * * Define o bot da sala de bate-papo
   * @param bot
   */
  public setBot(bot: Bot) {
    bot = bot;
  }

  /**
   * * Retorna o bot da sala de bate-papo
   * @returns
   */
  public getBot(): Bot {
    return bot;
  }

  /**
   * * Adiciona um novo membro a sala de bate-papo
   * @param member
   */
  public async addMember(member: User | string) {
    if (!(member instanceof User)) member = new User(`${member}`);

    await bot?.addMember(this, member);

    this.members[member.id] = member;
  }

  /**
   * * Remove um membro da sala de bate-papo
   * @param member
   * @returns
   */
  public async removeMember(member: User | string) {
    if (!(member instanceof User)) member = new User(`${member}`);

    await bot?.removeMember(this, member);

    delete this.members[member.id];
  }

  /**
   * * Retorna um membro da sala de bate-papo
   * @param member
   * @returns
   */
  public getMember(member: User | string): User | undefined {
    if (!(member instanceof User)) member = new User(`${member}`);

    return this.members[member.id];
  }

  /**
   * * Retorna a imagem do chat
   * @returns
   */
  public async getProfile(): Promise<any> {
    return await bot?.getProfile(this);
  }

  /**
   * * Define a imagem da sala de bate-papo
   * @param image
   */
  public async setProfile(image: Buffer): Promise<any> {
    return await bot?.setProfile(image, this);
  }

  /**
   * * Sai da sala de bate-papo
   * @returns
   */
  public async leave() {
    return await bot?.leaveChat(this);
  }
}
