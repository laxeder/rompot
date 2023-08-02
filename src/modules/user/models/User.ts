import { IChat, IUser } from "rompot-base";

import ClientModule from "@modules/client/models/ClientModule";

export default class User extends ClientModule implements IUser {
  public name: string = "";
  public id: string = "";

  constructor(id: string, name?: string) {
    super();

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

  async isAdmin(chat: IChat | string): Promise<boolean> {
    const admins = await this.client.getChatAdmins(chat);

    return admins.hasOwnProperty(this.id);
  }

  async isLeader(chat: IChat | string): Promise<boolean> {
    const leader = await this.client.getChatLeader(chat);

    return leader.id == this.id;
  }
}
