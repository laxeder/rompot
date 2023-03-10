import { ClientType } from "@modules/Client";
import { ClientBase } from "@modules/Base";
import Chat from "@modules/Chat";

export default class User {
  #client: ClientType = ClientBase();

  /** * ID */
  public id: string;
  /** * Nome */
  public name: string;
  /** * Descrição */
  public description: string;
  /** * Foto de perfil */
  public profile: Buffer;
  /** * É administrador */
  public isAdmin: boolean;
  /** É líder */
  public isLeader: boolean;

  get client(): ClientType {
    return this.#client;
  }

  set client(client: ClientType) {
    this.#client = client;
  }

  constructor(id: string, name?: string, description?: string, profile?: Buffer) {
    this.id = id || "";
    this.name = name || "";
    this.description = description || "";
    this.profile = profile || Buffer.from("");
    this.isAdmin = false;
    this.isLeader = false;
  }

  /** * Bloqueia o usuário */
  async blockUser(): Promise<void> {
    return this.client.blockUser(this);
  }

  /** Desbloqueia o usuário */
  async unblockUser(): Promise<void> {
    return this.client.unblockUser(this);
  }

  /**
   * @returns Retorna o nome do usuário
   */
  async getName(): Promise<string> {
    return this.client.getUserName(this);
  }

  /**
   * * Define o nome do usuário
   * @param name Nome do usuáro
   */
  async setName(name: string): Promise<void> {
    return this.client.setUserName(this, name);
  }

  /**
   * @returns Retorna a descrição do usuário
   */
  async getDescription(): Promise<string> {
    return this.client.getUserDescription(this);
  }

  /**
   * * Define a descrição do usuário
   * @param description Descrição do usuário
   */
  async setDescription(description: string): Promise<void> {
    return this.client.setUserDescription(this, description);
  }

  /**
   * @returns Retorna a imagem de perfil do usuário
   */
  async getProfile(): Promise<Buffer> {
    return this.client.getUserProfile(this);
  }

  /**
   * * Define a foto de perfil do usuário
   * @param image Foto de perfil do usuário
   */
  async setProfile(image: Buffer): Promise<void> {
    return this.client.setUserProfile(this, image);
  }

  /**
   * @param chat Sala de bate-papo que está o usuário
   * @returns Retorna se o usuário é administrador daquela sala de bate-papo
   */
  async IsAdmin(chat: Chat | string): Promise<boolean> {
    const admins = await this.client.getChatAdmins(Chat.getId(chat));

    return admins.hasOwnProperty(this.id);
  }

  /**
   * @param chat Sala de bate-papo que está o usuário
   * @returns Retorna se o usuário é lider daquela sala de bate-papo
   */
  async IsLeader(chat: Chat | string): Promise<boolean> {
    const leader = await this.client.getChatLeader(Chat.getId(chat));

    return leader.id == this.id;
  }

  /**
   * @param user Usuário que será obtido
   * @returns Retorna o usuário
   */
  public static get<USER extends User>(user: USER | string): USER | User {
    if (typeof user == "string") {
      return new User(user);
    }

    return user;
  }

  /**
   * @param user Usuário
   * @returns Retorna o ID do usuário
   */
  public static getId(user: User | string) {
    if (typeof user == "string") {
      return String(user || "");
    }

    if (typeof user == "object" && !Array.isArray(user) && user?.id) {
      return String(user.id);
    }

    return String(user || "");
  }

  /**
   * * Cria um usuário com cliente instanciado
   * @param client Cliente
   * @param user Usuário
   * @returns
   */
  public static Client<USER extends User>(client: ClientType, user: USER | string): USER | User {
    if (typeof user == "string") return this.Client(client, new User(user));

    user.client = client;

    return user;
  }
}
