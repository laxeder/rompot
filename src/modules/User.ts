import { IClient } from "@interfaces/IClient";
import { IChat } from "@interfaces/IChat";
import { IUser } from "@interfaces/IUser";

import { ClientBase } from "@modules/ClientBase";
import Chat from "@modules/Chat";

export default class User implements IUser {
  #client: IClient = ClientBase();

  public name: string;
  public id: string;

  get client(): IClient {
    return this.#client;
  }

  set client(client: IClient) {
    this.#client = client;
  }

  constructor(id: string, name?: string) {
    this.id = id || "";
    this.name = name || "";
  }

  async blockUser(): Promise<void> {
    return this.client.blockUser(this);
  }

  async unblockUser(): Promise<void> {
    return this.client.unblockUser(this);
  }

  async getName(): Promise<string> {
    return this.client.getUserName(this);
  }

  async setName(name: string): Promise<void> {
    return this.client.setUserName(this, name);
  }

  async getDescription(): Promise<string> {
    return this.client.getUserDescription(this);
  }

  async setDescription(description: string): Promise<void> {
    return this.client.setUserDescription(this, description);
  }

  async getProfile(): Promise<Buffer> {
    return this.client.getUserProfile(this);
  }

  async setProfile(image: Buffer): Promise<void> {
    return this.client.setUserProfile(this, image);
  }

  async IsAdmin(chat: IChat | string): Promise<boolean> {
    const admins = await this.client.getChatAdmins(Chat.getId(chat));

    return admins.hasOwnProperty(this.id);
  }

  async IsLeader(chat: IChat | string): Promise<boolean> {
    const leader = await this.client.getChatLeader(Chat.getId(chat));

    return leader.id == this.id;
  }

  /**
   * @param user Usuário que será obtido
   * @returns Retorna o usuário
   */
  public static get<USER extends IUser>(user: USER | string): USER | IUser {
    if (typeof user == "string") {
      return new User(user);
    }

    return user;
  }

  /**
   * @param user Usuário
   * @returns Retorna o ID do usuário
   */
  public static getId(user: IUser | string) {
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
  public static Client<USER extends IUser>(client: IClient, user: USER | string): USER | IUser {
    if (typeof user == "string") return this.Client(client, new User(user));

    user.client = client;

    return user;
  }
}
