import { IChat, ChatType, IUser, IMessage, ChatStatus } from "rompot-base";

import ClientModule from "@modules/client/models/ClientModule";
import UserUtils from "@modules/user/utils/UserUtils";

import MessageUtils from "@utils/MessageUtils";

export default class Chat extends ClientModule implements IChat {
  public id: string = "";
  public type: ChatType = "pv";
  public name: string = "";

  constructor(id: string, type?: ChatType, name?: string) {
    super();

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

  public async isAdmin(user: IUser | string): Promise<boolean> {
    const admins = await this.client.getChatAdmins(this);

    return admins.hasOwnProperty(UserUtils.getId(user));
  }

  public async isLeader(user: IUser | string): Promise<boolean> {
    const leader = await this.client.getChatLeader(this);

    return leader.id == UserUtils.getId(user);
  }

  public async getAdmins(): Promise<Record<string, IUser>> {
    return this.client.getChatAdmins(this);
  }

  public async getUsers(): Promise<Record<string, IUser>> {
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
    return this.client.demoteUserInChat(this, user);
  }

  public async leave(): Promise<void> {
    return this.client.leaveChat(this);
  }

  public async send(message: IMessage | string): Promise<IMessage> {
    const msg = MessageUtils.get(message);

    if (!msg.chat.id) msg.chat.id = this.id;
    if (!msg.user.id) msg.user.id = this.client.id;

    return this.client.send(msg);
  }

  public async changeStatus(status: ChatStatus): Promise<void> {
    return this.client.changeChatStatus(this, status);
  }
}
