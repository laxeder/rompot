import { IChat, IChatModule } from "@interfaces/Chat";
import { IUser } from "@interfaces/User";

import Message from "@messages/Message";

import { ClientType } from "@modules/Client";
import BotBase from "@modules/BotBase";

import { getMessage, getUser, getUserId, UserClient } from "@utils/Generic";

import { ChatStatus, ChatType } from "../types/Chat";
import { IUsers, Users } from "../types/User";

export default class Chat implements IChat, IChatModule {
  public id: string;
  public type: ChatType;
  public name: string;
  public description: string;
  public profile: Buffer;
  public status: ChatStatus;
  public users: Users = {};

  public client: ClientType = BotBase();

  constructor(id: string, type?: ChatType, name?: string, description?: string, profile?: Buffer, users?: IUsers, status?: ChatStatus) {
    this.id = id || "";
    this.type = type || "pv";
    this.name = name || "";
    this.description = description || "";
    this.profile = profile || Buffer.from("");
    this.status = status || "offline";

    for (const id in users) {
      this.users[id] = UserClient(this.client, users[id]);
    }
  }

  public async setName(name: string): Promise<void> {
    this.name = name;

    await this.client.setChatName(this, name);
  }

  public async getName(): Promise<string> {
    return this.client.getChatName(this);
  }

  public async getDescription(): Promise<string> {
    return this.client.getChatDescription(this);
  }

  public async setDescription(description: string): Promise<void> {
    this.description = description;

    return this.client.setChatDescription(this, description);
  }

  public async getProfile(): Promise<Buffer> {
    return this.client.getChatProfile(this);
  }

  public async setProfile(image: Buffer): Promise<void> {
    this.profile = image;

    return this.client.setChatProfile(this, image);
  }

  public async IsAdmin(user: IUser | string): Promise<boolean> {
    const admins = await this.client.getChatAdmins(this);

    return admins.hasOwnProperty(getUserId(user));
  }

  public async IsLeader(user: IUser | string): Promise<boolean> {
    const leader = await this.client.getChatLeader(this);

    return leader.id == getUserId(user);
  }

  public async getAdmins(): Promise<Users> {
    return this.client.getChatAdmins(this);
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
    return this.client.demoteUserInChat(this, getUser(user));
  }

  public async leave(): Promise<void> {
    return this.client.leaveChat(this);
  }

  public async send(message: Message | string): Promise<Message> {
    return this.client.send(getMessage(message));
  }

  public async changeStatus(status: ChatStatus): Promise<void> {
    return this.client.changeChatStatus(this, status);
  }
}
