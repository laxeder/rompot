import { IUser, IUserModule } from "@interfaces/User";
import { IChat } from "@interfaces/Chat";

import { ClientType } from "@modules/Client";
import BotBase from "@modules/BotBase";

import { getChatId } from "@utils/Generic";

export default class User implements IUser, IUserModule {
  public id: string;
  public name: string;
  public description: string;
  public profile: Buffer;
  public isAdmin: boolean;
  public isLeader: boolean;

  public client: ClientType = BotBase();

  constructor(id: string, name?: string, description?: string, profile?: Buffer) {
    this.id = id || "";
    this.name = name || "";
    this.description = description || "";
    this.profile = profile || Buffer.from("");
    this.isAdmin = false;
    this.isLeader = false;
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
    const chatId = getChatId(chat);

    const admins = await this.client.getChatAdmins(chatId);

    return admins.hasOwnProperty(this.id);
  }

  async IsLeader(chat: IChat | string): Promise<boolean> {
    const chatId = getChatId(chat);

    const leader = await this.client.getChatLeader(chatId);

    return leader.id == this.id;
  }
}
