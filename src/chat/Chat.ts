import type { IClient } from "../client";

import UserNotDefinedError from "../errors/UserNotDefinedError";
import ClientNotDefinedError from "../errors/ClientNotDefinedError";

import User from "../user/User";
import Message from "../messages/Message";

import ChatType from "../chat/ChatType";
import ChatStatus from "../chat/ChatStatus";

import { ClientUtils } from "../utils/ClientUtils";

export default class Chat {
  /** ID do bot associado a este chat */
  public botId?: string;
  /** ID do cliente associado a este chat */
  public clientId?: string;

  /** ID do chat */
  public id: string;
  /** Tipo do chat */
  public type: ChatType;

  /** Nome do chat */
  public name?: string;
  /** Número de telefone */
  public phoneNumber?: string;
  /** Descrição do chat */
  public description?: string;
  /** URL da imagem de perfil do chat */
  public profileUrl?: string;
  /** Quantidade de mensagens não lidas */
  public unreadCount?: number;
  /** Tempo da última interação com o chat */
  public timestamp?: number;

  /** [Group] Admins do chat */
  public admins?: string[];
  /** [Group] Líder do chat */
  public leader?: string;
  /** [Group] Usuários do chat */
  public users?: string[];

  /** [Telegram] Apelido do chat */
  public nickname?: string;

  /** Obter o cliente do chat */
  private get client(): IClient {
    if (!this.clientId) {
      throw new ClientNotDefinedError();
    }

    return ClientUtils.getClient(this.clientId);
  }

  /**
   * Cria uma instância de Chat.
   * @param id - O ID do chat.
   * @param type - O tipo do chat (opcional, padrão é ChatType.PV).
   * @param name - O nome do chat (opcional, padrão é uma string vazia).
   */
  constructor(id: string = "", type: ChatType = ChatType.PV, name?: string) {
    this.id = id;
    this.type = type;

    if (name) {
      this.name = name;
    }
  }

  /** Retorna o nome do chat. */
  public async getName(): Promise<string | undefined> {
    return this.client.getChatName(this);
  }

  /**
   * Define o nome do chat.
   * @param name - O novo nome para definir.
   */
  public async setName(name: string): Promise<void> {
    await this.client.setChatName(this, name);
  }

  /** Retorna a descrição do chat. */
  public getDescription(): Promise<string> | undefined {
    return this.client.getChatDescription(this);
  }

  /**
   * Define a descrição do chat.
   * @param description - A nova descrição para definir.
   */
  public async setDescription(description: string): Promise<void> {
    await this.client.setChatDescription(this, description);
  }

  /** Retorna o perfil do chat. */
  public getProfile(): Promise<Buffer | undefined> {
    return this.client.getChatProfile(this);
  }

  /**
   * Define o perfil do chat.
   * @param image - O novo perfil para definir como um Buffer.
   */
  public async setProfile(image: Buffer): Promise<void> {
    await this.client.setChatProfile(this, image);
  }

  /**
   * Verifica se um usuário é um administrador do chat.
   * @param user - O usuário ou ID do usuário a ser verificado.
   * @returns Verdadeiro se o usuário é um administrador, caso contrário, falso.
   */
  public async isAdmin(user: User | string): Promise<boolean> {
    const admins = await this.client.getChatAdmins(this);

    const userId = User.getId(user);

    if (!userId) {
      throw new UserNotDefinedError();
    }

    return admins.includes(userId);
  }

  /**
   * Verifica se um usuário é o líder do chat.
   * @param user - O usuário ou ID do usuário a ser verificado.
   * @returns verdadeiro se o usuário é o líder, caso contrário, falso.
   */
  public async isLeader(user: User | string): Promise<boolean> {
    const leader = await this.client.getChatLeader(this);

    return leader?.id == User.getId(user);
  }

  /** Retorna o ID dos administradores do chat. */
  public getAdmins(): Promise<string[]> {
    return this.client.getChatAdmins(this);
  }

  /** Retorna o ID dos usuários do chat. */
  public getUsers(): Promise<string[]> {
    return this.client.getChatUsers(this);
  }

  /**
   * Adiciona um usuário a este chat.
   * @param user - O usuário ou ID do usuário a ser adicionado.
   */
  public async addUser(user: User | string): Promise<void> {
    await this.client.addUserInChat(this, user);
  }

  /**
   * Remove um usuário do chat.
   * @param user - O usuário ou ID do usuário a ser removido.
   */
  public async removeUser(user: User | string): Promise<void> {
    await this.client.removeUserInChat(this, user);
  }

  /**
   * Promove um usuário a administrador do chat.
   * @param user - O usuário ou ID do usuário a ser promovido.
   */
  public async promote(user: User | string): Promise<void> {
    await this.client.promoteUserInChat(this, user);
  }

  /**
   * Rebaixa um administrador a membro do chat.
   * @param user - O usuário ou ID do usuário a ser rebaixado.
   */
  public async demote(user: User | string): Promise<void> {
    await this.client.demoteUserInChat(this, user);
  }

  /** Sai do chat. */
  public async leave(): Promise<void> {
    await this.client.leaveChat(this);
  }

  /**
   * Envia uma mensagem para este chat.
   * @param message - A mensagem ou objeto Message a ser enviado.
   * @returns Uma Promise que resolve para a mensagem enviada.
   */
  public async send(message: Message | string): Promise<Message> {
    const msg = Message.apply(message);

    if (!msg.chat.id) {
      msg.chat.id = this.id;
    }

    if (!msg.user.id && this.clientId) {
      msg.user.id = this.clientId;
    }

    const newMessage = await this.client.send(msg);

    return newMessage;
  }

  /**
   * Altera o status do chat.
   * @param status - O novo status a ser definido.
   * @returns Uma Promise que resolve quando o status do chat é alterado com sucesso.
   */
  public async changeStatus(status: ChatStatus): Promise<void> {
    await this.client.changeChatStatus(this, status);
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
   * Cria uma instância de Chat a partir de uma representação em formato JSON.
   * @param data - Os dados JSON a serem usados para criar a instância.
   * @returns Uma instância de Chat criada a partir dos dados JSON.
   */
  public static fromJSON(data: any): Chat {
    if (!data || typeof data != "object") {
      return new Chat("");
    }

    const chat = new Chat("");

    if (data.botId) chat.botId = data.botId;
    if (data.clientId) chat.clientId = data.clientId;

    if (data.id) chat.id = data.id;
    if (data.type) chat.type = data.type;

    if (data.name) chat.name = data.name;
    if (data.phoneNumber) chat.phoneNumber = data.phoneNumber;
    if (data.description) chat.description = data.description;
    if (data.profileUrl) chat.profileUrl = data.profileUrl;
    if (data.timestamp) chat.timestamp = data.timestamp;

    if (data.admins) chat.admins = data.admins;
    if (data.leader) chat.leader = data.leader;
    if (data.users) chat.users = data.users;

    if (data.nickname) chat.nickname = data.nickname;

    return chat;
  }

  /**
   * Retorna o ID de um chat.
   * @param chat - O chat ou ID do chat de onde obter o ID.
   */
  public static getId(chat: Chat | string): string | undefined {
    if (typeof chat == "object") {
      return chat?.id;
    }

    if (typeof chat == "string") {
      return chat;
    }

    return undefined;
  }

  /**
   * Retorna uma instância de Chat com base em um ID e/ou dados passados.
   * @param chat - O ID do chat ou uma instância existente de Chat.
   * @param data - Dados que serão aplicados no chat.
   */
  public static apply(chat: Chat | string, data?: Partial<Chat>) {
    if (!chat || typeof chat != "object") {
      chat = new Chat(`${chat}`);
    } else {
      chat = Chat.fromJSON(chat);
    }

    for (const [key, value] of Object.entries(data || {})) {
      chat[key] = value;
    }

    return chat;
  }

  /**
   * Verifica se um objeto é uma instância válida de Chat.
   * @param chat - O objeto a ser verificado.
   * @returns Verdadeiro se o objeto for uma instância válida de Chat, caso contrário, falso.
   */
  public static isValid(chat: any): chat is Chat {
    if (typeof chat != "object") return false;

    const keys = Object.keys(new Chat(""));

    return keys.every((key) => chat?.hasOwnProperty(key));
  }
}
