import { IChat, IClient, IUser, IUserController } from "rompot-base";

import ClientModule from "@modules/client/models/ClientModule";
import UserUtils from "@modules/user/utils/UserUtils";

export default class UserController extends ClientModule implements IUserController {
  #user?: IUser;

  set user(user: IUser) {
    if (!user) return;

    this.#user = user;
  }

  get user(): IUser {
    if (!this.#user) {
      this.#user = UserUtils.get("");
    }

    return this.#user;
  }

  constructor(user?: IUser, client?: IClient) {
    super(client);

    if (user) this.#user = user;
  }

  async blockUser(): Promise<void> {
    return this.client.blockUser(this.user);
  }

  async unblockUser(): Promise<void> {
    return this.client.unblockUser(this.user);
  }

  async getName(): Promise<string> {
    return this.client.getUserName(this.user);
  }

  async setName(name: string): Promise<void> {
    return this.client.setUserName(this.user, name);
  }

  async getDescription(): Promise<string> {
    return this.client.getUserDescription(this.user);
  }

  async setDescription(description: string): Promise<void> {
    return this.client.setUserDescription(this.user, description);
  }

  async getProfile(): Promise<Buffer> {
    return this.client.getUserProfile(this.user);
  }

  async setProfile(image: Buffer): Promise<void> {
    return this.client.setUserProfile(this.user, image);
  }

  async isAdmin(chat: IChat | string): Promise<boolean> {
    const admins = await this.client.getChatAdmins(chat);

    return admins.hasOwnProperty(this.user.id);
  }

  async isLeader(chat: IChat | string): Promise<boolean> {
    const leader = await this.client.getChatLeader(chat);

    return leader.id == this.user.id;
  }
}
