import { IChat, IChatModule } from "@interfaces/Chat";
import { IMessage } from "@interfaces/Messages";
import { IUser } from "@interfaces/User";

import { MessageModule } from "@messages/Message";

import { UserModule } from "@modules/User";
import { Client } from "@modules/Client";
import BotBase from "@modules/BotBase";

import { getMessage, getUser, getUserId } from "@utils/Generic";

import { ChatStatus, ChatType } from "../types/Chat";
import { IUsers, Users } from "../types/User";

export type ChatModule = IChat & IChatModule;

export function CreateChat(id: string, type?: ChatType, name?: string, description?: string, profile?: Buffer, users?: IUsers, status?: ChatStatus): IChat {
  return {
    id: id || "",
    type: type || "pv",
    name: name || "",
    description: description || "",
    profile: profile || Buffer.from(""),
    users: users || {},
    status: status || "offline",
  };
}

export function Chat(id: string, type?: ChatType, name?: string, description?: string, profile?: Buffer, users?: IUsers, status?: ChatStatus): ChatModule {
  return ChatModule(BotBase(), CreateChat(id, type, name, description, profile, users, status));
}

export function ChatClient<CLIENT extends Client>(client: CLIENT, id: string, type?: ChatType, name?: string, description?: string, profile?: Buffer, users?: IUsers, status?: ChatStatus) {
  return ChatModule(client, CreateChat(id, type, name, description, profile, users, status));
}

export function ChatModule<CLIENT extends Client, CHAT extends IChat>(client: CLIENT, chat: CHAT): CHAT & IChatModule {
  const module: CHAT & IChatModule = {
    ...chat,

    get client() {
      return client;
    },

    set client(c: CLIENT) {
      client = c;
    },

    async setName(name: string): Promise<void> {
      this.name = name;

      await client.setChatName(this, name);
    },

    async getName(): Promise<string> {
      return client.getChatName(this);
    },

    async getDescription(): Promise<string> {
      return client.getChatDescription(this);
    },

    async setDescription(description: string): Promise<void> {
      this.description = description;

      return client.setChatDescription(this, description);
    },

    async getProfile(): Promise<Buffer> {
      return client.getChatProfile(this);
    },

    async setProfile(image: Buffer): Promise<void> {
      this.profile = image;

      return client.setChatProfile(this, image);
    },

    async IsAdmin(user: IUser | string): Promise<boolean> {
      const admins = await client.getChatAdmins(this);

      return admins.hasOwnProperty(getUserId(user));
    },

    async IsLeader(user: IUser | string): Promise<boolean> {
      const leader = await client.getChatLeader(this);

      return leader.id == getUserId(user);
    },

    async getAdmins(): Promise<Users> {
      return client.getChatAdmins(this);
    },

    async addUser(user: IUser | string): Promise<void> {
      return client.addUserInChat(this, user);
    },

    async removeUser(user: IUser | string): Promise<void> {
      return client.removeUserInChat(this, user);
    },

    async promote(user: IUser | string): Promise<void> {
      return client.promoteUserInChat(this, user);
    },

    async demote(user: IUser | string): Promise<void> {
      return client.demoteUserInChat(this, getUser(user));
    },

    async leave(): Promise<void> {
      return client.leaveChat(this);
    },

    async send(message: IMessage | string): Promise<MessageModule> {
      return client.send(getMessage(message));
    },

    async changeStatus(status: ChatStatus): Promise<void> {
      return client.changeChatStatus(this, status);
    },
  };

  for (const id in chat.users) {
    module.users[id] = UserModule(client, chat.users[id]);
  }

  return module;
}
