import { IMessage } from "@interfaces/Messages";
import ICommand from "@interfaces/ICommand";
import { IUser } from "@interfaces/User";
import { IChat } from "@interfaces/Chat";
import IBot from "@interfaces/IBot";
import Auth from "@interfaces/Auth";

import Client, { ClientType } from "@modules/Client";
import User from "@modules/User";

import { BotEvents } from "@utils/Emmiter";

import { IChats, ChatStatus } from "../types/Chat";
import { BotStatus } from "../types/Bot";
import { IUsers } from "../types/User";

export function ClientBase(): ClientType {
  return new Client<BotBase, ICommand>(new BotBase());
}

export  class BotBase implements IBot {
  id: string = "";
  status: BotStatus = "offline";
  ev: BotEvents = new BotEvents();

  async connect(auth: Auth | string): Promise<void> {}

  async reconnect(alert?: boolean): Promise<void> {}

  async stop(reason: any): Promise<void> {}

  async readMessage(message: IMessage): Promise<void> {}

  async send(message: IMessage): Promise<IMessage> {
    return message;
  }

  async removeMessage(message: IMessage): Promise<void> {}

  async deleteMessage(message: IMessage): Promise<void> {}

  async getBotName(): Promise<string> {
    return "";
  }

  async setBotName(name: string): Promise<void> {}

  async getBotDescription(): Promise<string> {
    return "";
  }

  async setBotDescription(description: string): Promise<void> {}

  async getBotProfile(): Promise<Buffer> {
    return Buffer.from("");
  }

  async setBotProfile(image: Buffer): Promise<void> {}

  async addChat(chat: IChat): Promise<void> {}

  async removeChat(chat: IChat): Promise<void> {}

  async addUserInChat(chat: IChat, user: IUser): Promise<void> {}

  async removeUserInChat(chat: IChat, user: IUser): Promise<void> {}

  async promoteUserInChat(chat: IChat, user: IUser): Promise<void> {}

  async demoteUserInChat(chat: IChat, user: IUser): Promise<void> {}

  async changeChatStatus(chat: IChat, status: ChatStatus): Promise<void> {}

  async createChat(chat: IChat): Promise<void> {}

  async leaveChat(chat: IChat): Promise<void> {}

  async getChat(chat: IChat): Promise<IChat | null> {
    return null;
  }

  async setChat(chat: IChat): Promise<void> {}

  async getChatName(chat: IChat): Promise<string> {
    return "";
  }

  async setChatName(chat: IChat, name: string): Promise<void> {}

  async getChatDescription(chat: IChat): Promise<string> {
    return "";
  }

  async setChatDescription(chat: IChat, description: string): Promise<void> {}

  async getChatProfile(chat: IChat): Promise<Buffer> {
    return Buffer.from("");
  }

  async setChatProfile(chat: IChat, profile: Buffer): Promise<void> {}

  async getChatAdmins(chat: IChat): Promise<IUsers> {
    return {};
  }

  async getChatLeader(chat: IChat): Promise<IUser> {
    return new User("");
  }

  async getChats(): Promise<IChats> {
    return {};
  }

  async setChats(chats: IChats): Promise<void> {}

  async addUser(user: IUser): Promise<void> {}

  async removeUser(user: IUser): Promise<void> {}

  async getUser(user: IUser): Promise<IUser | null> {
    return null;
  }

  async setUser(user: IUser): Promise<void> {}

  async getUserName(user: IUser): Promise<string> {
    return "";
  }

  async setUserName(user: IUser, name: string): Promise<void> {}

  async getUserDescription(user: IUser): Promise<string> {
    return "";
  }

  async setUserDescription(user: IUser, description: string): Promise<void> {}

  async getUserProfile(user: IUser): Promise<Buffer> {
    return Buffer.from("");
  }

  async setUserProfile(user: IUser, profile: Buffer): Promise<void> {}

  async unblockUser(user: IUser): Promise<void> {}

  async blockUser(user: IUser): Promise<void> {}

  async getUsers(): Promise<IUsers> {
    return {};
  }

  async setUsers(users: IUsers): Promise<void> {}

  async addReaction(message: IMessage, reaction: string): Promise<void> {}

  async removeReaction(message: IMessage): Promise<void> {}
}
