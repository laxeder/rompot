import { IUser, IUserModule } from "@interfaces/User";
import { IChat } from "@interfaces/Chat";

import { ClientType } from "@modules/Client";
import BotBase from "@modules/BotBase";

import { getChatId } from "@utils/Generic";

export type UserModule = IUser & IUserModule;

export function CreateUser(id: string, name?: string, description?: string, profile?: Buffer) {
  return {
    id: id || "",
    name: name || "",
    description: description || "",
    profile: profile || Buffer.from(""),
  };
}

export function User(id: string, name?: string, description?: string, profile?: Buffer): UserModule {
  return UserModule(BotBase(), CreateUser(id, name, description, profile));
}

export function UserClient<CLIENT extends ClientType>(client: CLIENT, id: string, name?: string, description?: string, profile?: Buffer): UserModule {
  return UserModule(client, CreateUser(id, name, description, profile));
}

export function UserModule<CLIENT extends ClientType, USER extends IUser>(client: CLIENT, user: USER): USER & IUserModule {
  const module = {
    ...user,

    get client(): CLIENT {
      return client;
    },

    set client(c: CLIENT) {
      client = c;
    },

    blockUser(): Promise<void> {
      return this.client.blockUser(this);
    },

    async unblockUser(): Promise<void> {
      return this.client.unblockUser(this);
    },

    async getName(): Promise<string> {
      return this.client.getUserName(this);
    },

    async setName(name: string): Promise<void> {
      return this.client.setUserName(this, name);
    },

    async getDescription(): Promise<string> {
      return this.client.getUserDescription(this);
    },

    async setDescription(description: string): Promise<void> {
      return this.client.setUserDescription(this, description);
    },

    async getProfile(): Promise<Buffer> {
      return this.client.getUserProfile(this);
    },

    async setProfile(image: Buffer): Promise<void> {
      return this.client.setUserProfile(this, image);
    },

    async IsAdmin(chat: IChat | string): Promise<boolean> {
      const chatId = getChatId(chat);

      const admins = await this.client.getChatAdmins(chatId);

      return admins.hasOwnProperty(this.id);
    },

    async IsLeader(chat: IChat | string): Promise<boolean> {
      const chatId = getChatId(chat);

      const leader = await this.client.getChatLeader(chatId);

      return leader.id == this.id;
    },
  };

  return module;
}
