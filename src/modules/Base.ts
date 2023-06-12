import type { ChatStatus, IChats, IUsers, Media } from "../types";
import type { BotStatus } from "../types/Bot";

import { IMessage, IReactionMessage } from "@interfaces/IMessage";
import { IAuth } from "@interfaces/IAuth";
import { IChat } from "@interfaces/IChat";
import { IUser } from "@interfaces/IUser";
import { IBot } from "@interfaces/IBot";

import User from "@modules/User";

import { BotEvents } from "@utils/Emmiter";

export class BotBase implements IBot {
  public id: string = "";
  public status: BotStatus = "offline";
  public ev: BotEvents = new BotEvents();

  //! #################################################################
  //! ########## MÉTODOS DE CONEXÃO
  //! #################################################################

  public async connect(auth: IAuth): Promise<void> {}

  public async reconnect(alert?: boolean): Promise<void> {}

  public async stop(reason: any): Promise<void> {}

  //! #################################################################
  //! ########## MÉTODOS DE MENSAGEM
  //! #################################################################

  public async send(message: IMessage): Promise<IMessage> {
    return message;
  }

  public async editMessage(message: IMessage): Promise<void> {}

  public async addReaction(message: IReactionMessage): Promise<void> {}

  public async removeReaction(message: IReactionMessage): Promise<void> {}

  public async readMessage(message: IMessage): Promise<void> {}

  public async removeMessage(message: IMessage): Promise<void> {}

  public async deleteMessage(message: IMessage): Promise<void> {}

  public async downloadStreamMessage(media: Media): Promise<Buffer> {
    return Buffer.from("");
  }

  //! #################################################################
  //! ########## MÉTODOS DO BOT
  //! #################################################################

  public async getBotName(): Promise<string> {
    return "";
  }

  public async setBotName(name: string): Promise<void> {}

  public async getBotDescription(): Promise<string> {
    return "";
  }

  public async setBotDescription(description: string): Promise<void> {}

  public async getBotProfile(): Promise<Buffer> {
    return Buffer.from("");
  }

  public async setBotProfile(image: Buffer): Promise<void> {}

  //! #################################################################
  //! ########## MÉTODOS DO CHAT
  //! #################################################################

  public async getChats(): Promise<IChats> {
    return {};
  }

  public async setChats(chats: IChats): Promise<void> {}

  public async getChat(chat: IChat): Promise<IChat | null> {
    return null;
  }

  public async setChat(chat: IChat): Promise<void> {}

  public async addChat(chat: IChat): Promise<void> {}

  public async removeChat(chat: IChat): Promise<void> {}

  public async createChat(chat: IChat): Promise<void> {}

  public async leaveChat(chat: IChat): Promise<void> {}

  public async addUserInChat(chat: IChat, user: IUser): Promise<void> {}

  public async removeUserInChat(chat: IChat, user: IUser): Promise<void> {}

  public async promoteUserInChat(chat: IChat, user: IUser): Promise<void> {}

  public async demoteUserInChat(chat: IChat, user: IUser): Promise<void> {}

  public async changeChatStatus(chat: IChat, status: ChatStatus): Promise<void> {}

  public async getChatUsers(chat: IChat): Promise<IUsers> {
    return {};
  }

  public async getChatAdmins(chat: IChat): Promise<IUsers> {
    return {};
  }

  public async getChatLeader(chat: IChat): Promise<IUser> {
    return new User("");
  }

  public async getChatName(chat: IChat): Promise<string> {
    return "";
  }

  public async setChatName(chat: IChat, name: string): Promise<void> {}

  public async getChatDescription(chat: IChat): Promise<string> {
    return "";
  }

  public async setChatDescription(chat: IChat, description: string): Promise<void> {}

  public async getChatProfile(chat: IChat): Promise<Buffer> {
    return Buffer.from("");
  }

  public async setChatProfile(chat: IChat, profile: Buffer): Promise<void> {}

  //! #################################################################
  //! ########## MÉTODOS DO USUÁRIO
  //! #################################################################

  public async getUsers(): Promise<IUsers> {
    return {};
  }

  public async setUsers(users: IUsers): Promise<void> {}

  public async getUser(user: IUser): Promise<IUser | null> {
    return null;
  }

  public async setUser(user: IUser): Promise<void> {}

  public async addUser(user: IUser): Promise<void> {}

  public async removeUser(user: IUser): Promise<void> {}

  public async unblockUser(user: IUser): Promise<void> {}

  public async blockUser(user: IUser): Promise<void> {}

  public async getUserName(user: IUser): Promise<string> {
    return "";
  }

  public async setUserName(user: IUser, name: string): Promise<void> {}

  public async getUserDescription(user: IUser): Promise<string> {
    return "";
  }

  public async setUserDescription(user: IUser, description: string): Promise<void> {}

  public async getUserProfile(user: IUser): Promise<Buffer> {
    return Buffer.from("");
  }

  public async setUserProfile(user: IUser, profile: Buffer): Promise<void> {}
}
