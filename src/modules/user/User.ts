import type Chat from "../chat/Chat";
import type { IClient } from "../../client";

import ClientNotDefinedError from "../../errors/ClientNotDefinedError";


import { ClientUtils } from "../../utils/ClientUtils";

export default class User {
  /** ID do bot associado a este usuário */
  public botId?: string = "";
  /** ID do cliente associado a este usuário */
  public clientId?: string = "";

  /** ID do usuário */
  public id: string = "";
  /** Nome do usuário */
  public name?: string;

  /** Nome salvado do usuário */
  public savedName?: string;
  /** Número de telefone */
  public phoneNumber?: string;
  /** Descrição do usuário */
  public description?: string;
  /** URL da imagem de perfil do usuário */
  public profileUrl?: string;

  /** [Telegram] Apelido do usuário */
  public nickname?: string;

  /** Obter o cliente do chat */
  private get client(): IClient {
    if (!this.clientId) {
      throw new ClientNotDefinedError();
    }

    return ClientUtils.getClient(this.clientId);
  }

  /**
   * Cria uma instância de User.
   * @param id - O ID do usuário.
   * @param name - O nome do usuário (opcional, padrão é uma string vazia).
   */
  constructor(id: string, name?: string) {
    this.id = id;

    if (name) {
      this.name = name;
    }
  }

  /** Bloqueia o usuário. */
  public async blockUser(): Promise<void> {
    await this.client.blockUser(this);
  }

  /** Desbloqueia o usuário. */
  public async unblockUser(): Promise<void> {
    await this.client.unblockUser(this);
  }

  /** Retorna o nome do usuário. */
  public async getName(): Promise<string | undefined> {
    return this.client.getUserName(this);
  }

  /**
   * Define o nome do usuário.
   * @param name - O novo nome para definir.
   */
  public async setName(name: string): Promise<void> {
    await this.client.setUserName(this, name);
  }

  /** Retorna a descrição do usuário. */
  public async getDescription(): Promise<string | undefined> {
    return this.client.getUserDescription(this);
  }

  /**
   * Define a descrição do usuário.
   * @param description - A nova descrição para definir.
   */
  public async setDescription(description: string): Promise<void> {
    await this.client.setUserDescription(this, description);
  }

  /** Retorna o perfil do usuário. */
  public async getProfile(): Promise<Buffer | undefined> {
    return this.client.getUserProfile(this);
  }

  /**
   * Define o perfil do usuário.
   * @param image - O novo perfil para definir como um Buffer.
   */
  public async setProfile(image: Buffer): Promise<void> {
    await this.client.setUserProfile(this, image);
  }

  /**
   * Verifica se o usuário é um administrador de um chat.
   * @param chat - O chat ou ID do chat a ser verificado.
   */
  public async isAdmin(chat: Chat | string): Promise<boolean> {
    const admins = await this.client.getChatAdmins(chat);

    return admins.includes(this.id);
  }

  /**
   * Verifica se o usuário é o líder de um chat.
   * @param chat - O chat ou ID do chat a ser verificado.
   */
  public async isLeader(chat: Chat | string): Promise<boolean> {
    const leader = await this.client.getChatLeader(chat);

    return leader?.id == this.id;
  }

  /**
   * Converte o objeto atual para uma representação em formato JSON.
   * @returns Um objeto JSON que representa o estado atual do objeto.
   */
  public toJSON(): any {
    const data: Record<string, any> = {};

    for (const [key, value] of Object.entries(this)) {
      if (key == "toJSON") continue;

      data[key] = value;
    }

    return JSON.parse(JSON.stringify(data));
  }

  /**
   * Cria uma instância de User a partir de uma representação em formato JSON.
   * @param data - Os dados JSON a serem usados para criar a instância.
   */
  public static fromJSON(data: any): User {
    if (!data || typeof data != "object") {
      return new User("");
    }

    const user = new User("");

    if (data.botId) user.botId = data.botId;
    if (data.clientId) user.clientId = data.clientId;

    if (data.id) user.id = data.id;

    if (data.name) user.name = data.name;
    if (data.savedName) user.phoneNumber = data.phoneNumber;
    if (data.phoneNumber) user.phoneNumber = data.phoneNumber;
    if (data.description) user.description = data.description;
    if (data.profileUrl) user.profileUrl = data.profileUrl;

    if (data.nickname) user.nickname = data.nickname;

    return user;
  }

  /**
   * Retorna uma instância de User com base em um ID e/ou dados passados.
   * @param user - O ID do usuário ou uma instância existente de User.
   * @param data - Dados que serão aplicados no usuário.
   */
  public static apply(user: User | string, data?: Partial<User>) {
    if (!user || typeof user != "object") {
      user = new User(`${user}`);
    } else {
      user = User.fromJSON(user);
    }

    for (const key of Object.keys(data || {})) {
      user[key] = data?.[key];
    }

    return user;
  }

  /**
   * Retorna o ID de um usuário.
   * @param user - O usuário ou ID do usuário de onde obter o ID.
   * @returns O ID do usuário como uma string, ou uma string vazia se o usuário for inválido.
   */
  public static getId(user: User | string): string | undefined {
    if (typeof user === "object") {
      return user?.id;
    }

    if (typeof user === "string") {
      return user;
    }

    return undefined;
  }

  /**
   * Verifica se um objeto é uma instância válida de User.
   * @param user - O objeto a ser verificado.
   */
  public static isValid(user: any): user is User {
    return (
      typeof user === "object" &&
      Object.keys(new User("")).every((key) => user?.hasOwnProperty(key))
    );
  }
}
