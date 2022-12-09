import { ChatTypes } from "../types/ChatTypes";
import { Bot } from "@models/Bot";
import { User } from "@models/User";

export class Chat {
  private _bot: Bot = new Bot();

  public members: { [key: string]: User } = {};
  public type: keyof ChatTypes = "pv";

  public id: string;
  public name?: string;
  public isOld?: boolean;

  constructor(id: string, name?: string, isOld?: boolean) {
    this.id = id;

    if (name) this.name = name;
    if (isOld) this.isOld = isOld;
  }

  /**
   * * Define o ID da sala de bate-papo
   * @param id
   */
  public setId(id: string) {
    this.id = id;
  }

  /**
   * * Define o nome da sala de bate-papo
   * @param name
   */
  public setName(name: string) {
    this.name = name;
  }

  /**
   * * Define se é uma nova sala de bate-papo
   * @param isOld
   */
  public setIsOld(isOld: boolean) {
    this.isOld = isOld;
  }

  /**
   * * Retorna o ID da sala de bate-papo
   * @returns
   */
  public getId(): string {
    return this.id;
  }

  /**
   * * Retorna o nome da sala de bate-papo
   * @returns
   */
  public getName(): string | undefined {
    return this.name;
  }

  /**
   * * Retorna se é uma nova sala de bate-papo
   * @returns
   */
  public getIsOld(): boolean {
    return this.isOld || false;
  }

  /**
   * * Define o bot da sala de bate-papo
   * @param bot
   */
  public setBot(bot: Bot) {
    this._bot = bot;
  }

  /**
   * * Retorna o bot da sala de bate-papo
   * @returns
   */
  public getBot(): Bot {
    return this._bot;
  }

  /**
   * * Adiciona um novo membro a sala de bate-papo
   * @param external
   * @param member
   */
  public async addMember(member: User | string, external: boolean = true) {
    if (!(member instanceof User)) member = new User(`${member}`);

    if (external && this._bot) {
      await this._bot.addMember(this, member);
    }

    this.members[member.id] = member;
  }

  /**
   * * Remove um membro da sala de bate-papo
   * @param member
   * @param external
   * @returns
   */
  public async removeMember(member: User | string, external: boolean = true) {
    if (!(member instanceof User)) member = new User(`${member}`);

    if (external && this._bot) {
      await this._bot.removeMember(this, member);
    }

    delete this.members[member.id];
  }

  /**
   * * Define os membros da sala de bate-papo
   * @param members
   */
  public setMembers(members: { [key: string]: User }) {
    this.members = members;
  }

  /**
   * * Retorna os membros da sala de bate-papo
   * @returns
   */
  public getMembers(): { [key: string]: User } {
    return this.members;
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
   * * Definir tipo da sala de bate-papo
   * @param type
   */
  public setType(type: keyof ChatTypes) {
    this.type = type;
  }

  /**
   * * Retorna o tipo da sala de bate-papo
   * @returns
   */
  public getType(): keyof ChatTypes {
    return this.type;
  }
}
