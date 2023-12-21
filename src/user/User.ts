import Chat from "../chat/Chat";

import { ClientUtils } from "../utils/ClientUtils";
import { injectJSON } from "../utils/Generic";

export default class User {
  /** ID do bot associado a este usuário */
  public botId: string = "";
  /** ID do cliente associado a este usuário */
  public clientId: string = "";
  /** ID do usuário */
  public id: string = "";
  /** Nome do usuário */
  public name: string = "";
  /** Apelido do usuário */
  public nickname: string = "";
  /** Descrição do usuário */
  public description: string = "";
  /** Número de telefone */
  public phoneNumber: string = "";
  /** Nome salvado do usuário */
  public savedName: string = "";
  /** URL da imagem de perfil do usuário */
  public profileUrl: string = "";

  /**
   * Cria uma instância de User.
   * @param id - O ID do usuário.
   * @param name - O nome do usuário (opcional, padrão é uma string vazia).
   */
  constructor(id: string, name: string = "") {
    this.id = id;
    this.name = name;
  }

  /**
   * Bloqueia o usuário.
   * @returns Uma Promise que resolve quando o usuário é bloqueado com sucesso.
   */
  public async blockUser(): Promise<void> {
    return ClientUtils.getClient(this.clientId).blockUser(this);
  }

  /**
   * Desbloqueia o usuário.
   * @returns Uma Promise que resolve quando o usuário é desbloqueado com sucesso.
   */
  public async unblockUser(): Promise<void> {
    return ClientUtils.getClient(this.clientId).unblockUser(this);
  }

  /**
   * Obtém o nome do usuário.
   * @returns Uma string representando o nome do usuário.
   */
  public async getName(): Promise<string> {
    return ClientUtils.getClient(this.clientId).getUserName(this);
  }

  /**
   * Define o nome do usuário.
   * @param name - O novo nome para definir.
   * @returns Uma Promise que resolve quando o nome do usuário é definido com sucesso.
   */
  public async setName(name: string): Promise<void> {
    return ClientUtils.getClient(this.clientId).setUserName(this, name);
  }

  /**
   * Obtém a descrição do usuário.
   * @returns Uma string representando a descrição do usuário.
   */
  public async getDescription(): Promise<string> {
    return ClientUtils.getClient(this.clientId).getUserDescription(this);
  }

  /**
   * Define a descrição do usuário.
   * @param description - A nova descrição para definir.
   * @returns Uma Promise que resolve quando a descrição do usuário é definida com sucesso.
   */
  public async setDescription(description: string): Promise<void> {
    return ClientUtils.getClient(this.clientId).setUserDescription(this, description);
  }

  /**
   * Obtém o perfil do usuário.
   * @returns Um Buffer representando o perfil do usuário.
   */
  public async getProfile(): Promise<Buffer> {
    return ClientUtils.getClient(this.clientId).getUserProfile(this);
  }

  /**
   * Define o perfil do usuário.
   * @param image - O novo perfil para definir como um Buffer.
   * @returns Uma Promise que resolve quando o perfil do usuário é definido com sucesso.
   */
  public async setProfile(image: Buffer): Promise<void> {
    return ClientUtils.getClient(this.clientId).setUserProfile(this, image);
  }

  /**
   * Verifica se o usuário é um administrador de um chat.
   * @param chat - O chat ou ID do chat a ser verificado.
   * @returns Verdadeiro se o usuário é um administrador do chat, caso contrário, falso.
   */
  public async isAdmin(chat: Chat | string): Promise<boolean> {
    return (await ClientUtils.getClient(this.clientId).getChatAdmins(chat)).includes(this.id);
  }

  /**
   * Verifica se o usuário é o líder de um chat.
   * @param chat - O chat ou ID do chat a ser verificado.
   * @returns Verdadeiro se o usuário é o líder do chat, caso contrário, falso.
   */
  public async isLeader(chat: Chat | string): Promise<boolean> {
    return (await ClientUtils.getClient(this.clientId).getChatLeader(chat))?.id == this.id;
  }

  /**
   * Converte o objeto atual para uma representação em formato JSON.
   * @returns Um objeto JSON que representa o estado atual do objeto.
   */
  public toJSON(): any {
    const data: Record<string, any> = {};

    for (const key of Object.keys(this)) {
      if (key == "toJSON") continue;

      data[key] = this[key];
    }

    return JSON.parse(JSON.stringify(data));
  }

  /**
   * Cria uma instância de User a partir de uma representação em formato JSON.
   * @param data - Os dados JSON a serem usados para criar a instância.
   * @returns Uma instância de User criada a partir dos dados JSON.
   */
  public static fromJSON(data: any): User {
    if (!data || typeof data != "object") {
      return new User("");
    }

    return injectJSON(data, new User(""));
  }

  /**
   * Obtém uma instância de User com base em um ID e/ou dados passados.
   * @param user - O ID do usuário ou uma instância existente de User.
   * @param data - Dados que serão aplicados no usuário.
   * @returns Uma instância de User com os dados passados.
   */
  public static apply(user: User | string, data?: Partial<User>) {
    if (!user || typeof user != "object") {
      user = new User(`${user}`);
    } else {
      user = User.fromJSON(user);
    }

    for (const key of Object.keys(data || {})) {
      user[key] = data[key];
    }

    return user;
  }

  /**
   * Obtém o ID de um usuário.
   * @param user - O usuário ou ID do usuário de onde obter o ID.
   * @returns O ID do usuário como uma string, ou uma string vazia se o usuário for inválido.
   */
  public static getId(user: User | string): string {
    return typeof user == "object" ? user?.id || "" : typeof user == "string" ? user : "";
  }

  /**
   * Verifica se um objeto é uma instância válida de User.
   * @param user - O objeto a ser verificado.
   * @returns Verdadeiro se o objeto for uma instância válida de User, caso contrário, falso.
   */
  public static isValid(user: any): user is User {
    return typeof user === "object" && Object.keys(new User("")).every((key) => user?.hasOwnProperty(key));
  }
}
