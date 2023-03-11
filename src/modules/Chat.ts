import Message from "@messages/Message";

import { ClientType } from "@modules/Client";
import { ClientBase } from "@modules/Base";
import User from "@modules/User";

import { ChatStatus, ChatType } from "../types/Chat";
import { Users } from "../types/User";

export default class Chat {
  #client: ClientType = ClientBase();

  /** * ID */
  public id: string;
  /** * Tipo */
  public type: ChatType;
  /** * Nome */
  public name: string;
  /** * Descrição */
  public description: string;
  /** * Foto de perfil */
  public profile: Buffer;
  /** * Usuários da sala de bate-papo */
  public users: Users = {};

  get client(): ClientType {
    return this.#client;
  }

  set client(client: ClientType) {
    this.#client = client;

    for (const u in this.users) {
      this.users[u].client = this.client;
    }
  }

  constructor(id: string, type?: ChatType, name?: string, description?: string, profile?: Buffer, users?: Users) {
    this.id = id || "";
    this.type = type || "pv";
    this.name = name || "";
    this.description = description || "";
    this.profile = profile || Buffer.from("");

    for (const id in users) {
      this.users[id] = User.Client(this.client, users[id]);
    }
  }

  /**
   * @returns Retorna o nome da sala de bate-papo
   */
  public async getName(): Promise<string> {
    return this.client.getChatName(this);
  }

  /**
   * * Define o nome da sala de bate-pao
   * @param name Nome da sala de bate-pao
   */
  public async setName(name: string): Promise<void> {
    this.name = name;

    await this.client.setChatName(this, name);
  }

  /**
   * @returns Retorna a descrição da sala de bate-papo
   */
  public async getDescription(): Promise<string> {
    return this.client.getChatDescription(this);
  }

  /**
   * * Define a descrição da sala de bate-pao
   * @param description Descrição da  sala de bate-pao
   */
  public async setDescription(description: string): Promise<void> {
    this.description = description;

    return this.client.setChatDescription(this, description);
  }

  /**
   * @returns Retorna a imagem de perfil da sala de bate-papo
   */
  public async getProfile(): Promise<Buffer> {
    return this.client.getChatProfile(this);
  }

  /**
   * * Define a foto de perfil da sala de bate-papo
   * @param image Foto de perfil da sala de bate-papo
   */
  public async setProfile(image: Buffer): Promise<void> {
    this.profile = image;

    return this.client.setChatProfile(this, image);
  }

  /**
   * @param user Usuário que será verificado
   * @returns Retorna se o usuário é administrador da sala de bate-papo
   */
  public async IsAdmin(user: User | string): Promise<boolean> {
    const admins = await this.client.getChatAdmins(this);

    return admins.hasOwnProperty(User.getId(user));
  }

  /**
   * @param user Usuário que será verificado
   * @returns Retorna se o usuário é lider da sala de bate-papo
   */
  public async IsLeader(user: User | string): Promise<boolean> {
    const leader = await this.client.getChatLeader(this);

    return leader.id == User.getId(user);
  }

  /**
   * @returns Retorna os administradores daquela sala de bate-papo
   */
  public async getAdmins(): Promise<Users> {
    return this.client.getChatAdmins(this);
  }

  /**
   * * Adiciona um usuário a sala de bate-papo
   * @param user Usuário que será adicionado
   */
  public async addUser(user: User | string): Promise<void> {
    return this.client.addUserInChat(this, user);
  }

  /**
   * * Remove um usuário da sala de bate-papo
   * @param user
   */
  public async removeUser(user: User | string): Promise<void> {
    return this.client.removeUserInChat(this, user);
  }

  /**
   * * Promove a administrador um usuário da sala de bate-papo
   * @param user Usuário que será promovido
   */
  public async promote(user: User | string): Promise<void> {
    return this.client.promoteUserInChat(this, user);
  }

  /**
   * * Remove o administrador de um usuário da sala de bate-papo
   * @param user Usuário que terá sua administração removida
   */
  public async demote(user: User | string): Promise<void> {
    return this.client.demoteUserInChat(this, User.get(user));
  }

  /**
   * * Sai da sala de bate-papo
   */
  public async leave(): Promise<void> {
    return this.client.leaveChat(this);
  }

  /**
   * * Envia uma mensagem na sala de bate-papo que a mensagem foi enviada
   * @param message Mensagem que será enviada
   */
  public async send(message: Message | string): Promise<Message> {
    const msg = Message.get(message);

    if (!!!msg.chat.id) msg.chat.id = this.id;
    if (!!!msg.user.id) msg.user.id = this.client.id;

    return this.client.send(msg);
  }

  /**
   * * Altera o status da sala de bate-pappo
   * @param status Status da sala de bate-papo
   */
  public async changeStatus(status: ChatStatus): Promise<void> {
    return this.client.changeChatStatus(this, status);
  }

  /**
   * @param chat Sala de bate-papo que será obtida
   * @returns Retorna a sala de bate-papo
   */
  public static get<CHAT extends Chat>(chat: CHAT | string): CHAT | Chat {
    if (typeof chat == "string") {
      return new Chat(chat);
    }

    return chat;
  }

  /**
   * @param chat Sala de bate-papo
   * @returns Retorna o ID da sala de bate-papo
   */
  public static getId(chat: Chat | string): string {
    if (typeof chat == "string") {
      return String(chat || "");
    }

    if (typeof chat == "object" && !Array.isArray(chat) && chat?.id) {
      return String(chat.id);
    }

    return String(chat || "");
  }

  /**
   * * Cria uma sala de bate-papo com cliente instanciado
   * @param client Cliente
   * @param chat Sala de bate-papo
   */
  public static Client<CHAT extends Chat>(client: ClientType, chat: CHAT | string): CHAT | Chat {
    if (typeof chat == "string") return this.Client(client, new Chat(chat));

    chat.client = client;

    return chat;
  }
}
