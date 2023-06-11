import type { ChatStatus, ChatType } from "../types/Chat";
import type { IUsers } from "../types/User";

import { IMessage } from "@interfaces/IMessage";
import { IClient } from "@interfaces/IClient";
import { IUser } from "@interfaces/IUser";
import { IChat } from "@interfaces/IChat";

import Message from "@messages/Message";

import { ClientBase } from "@modules/ClientBase";
import User from "@modules/User";

export default class Chat implements IChat {
  #client: IClient = ClientBase();

  public type: ChatType;
  public name: string;
  public id: string;

  get client(): IClient {
    return this.#client;
  }

  set client(client: IClient) {
    this.#client = client;
  }

  constructor(id: string, type?: ChatType, name?: string) {
    this.id = id || "";
    this.type = type || "pv";
    this.name = name || "";
  }

  public async getName(): Promise<string> {
    return this.client.getChatName(this);
  }

  public async setName(name: string): Promise<void> {
    await this.client.setChatName(this, name);
  }

  public async getDescription(): Promise<string> {
    return this.client.getChatDescription(this);
  }

  public async setDescription(description: string): Promise<void> {
    return this.client.setChatDescription(this, description);
  }

  public async getProfile(): Promise<Buffer> {
    return this.client.getChatProfile(this);
  }

  public async setProfile(image: Buffer): Promise<void> {
    return this.client.setChatProfile(this, image);
  }

  public async IsAdmin(user: IUser | string): Promise<boolean> {
    const admins = await this.client.getChatAdmins(this);

    return admins.hasOwnProperty(User.getId(user));
  }

  public async IsLeader(user: IUser | string): Promise<boolean> {
    const leader = await this.client.getChatLeader(this);

    return leader.id == User.getId(user);
  }

  public async getAdmins(): Promise<IUsers> {
    return this.client.getChatAdmins(this);
  }

  public async getUsers(): Promise<IUsers> {
    return await this.client.getChatUsers(this);
  }

  public async addUser(user: IUser | string): Promise<void> {
    return this.client.addUserInChat(this, user);
  }

  public async removeUser(user: IUser | string): Promise<void> {
    return this.client.removeUserInChat(this, user);
  }

  public async promote(user: IUser | string): Promise<void> {
    return this.client.promoteUserInChat(this, user);
  }

  public async demote(user: IUser | string): Promise<void> {
    return this.client.demoteUserInChat(this, User.get(user));
  }

  public async leave(): Promise<void> {
    return this.client.leaveChat(this);
  }

  public async send(message: IMessage | string): Promise<IMessage> {
    const msg = Message.get(message);

    if (!!!msg.chat.id) msg.chat.id = this.id;
    if (!!!msg.user.id) msg.user.id = this.client.id;

    return this.client.send(msg);
  }

  public async changeStatus(status: ChatStatus): Promise<void> {
    return this.client.changeChatStatus(this, status);
  }

  /**
   * @param chat Sala de bate-papo que será obtida
   * @returns Retorna a sala de bate-papo
   */
  public static get<CHAT extends IChat>(chat: CHAT | string): CHAT | IChat {
    if (typeof chat == "string") {
      return new Chat(chat);
    }

    return chat;
  }

  /**
   * @param chat Sala de bate-papo
   * @returns Retorna o ID da sala de bate-papo
   */
  public static getId(chat: IChat | string): string {
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
  public static Client<CHAT extends IChat>(client: IClient, chat: CHAT | string): CHAT | IChat {
    if (typeof chat == "string") return this.Client(client, new Chat(chat));

    chat.client = client;

    return chat;
  }
}
