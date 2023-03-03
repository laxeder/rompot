import { IChat, ChatModule } from "@interfaces/Chat";
import { IMessage } from "@interfaces/Messages";
import IUser from "@interfaces/User";

import Message from "@messages/Message";

import User, { GenerateUser } from "@modules/User";

import { ChatStatus, ChatType } from "../types/Chat";
import { Users } from "../types/User";
import { Bot } from "../types/Bot";

export default class Chat implements IChat {
  public id: string;
  public type: ChatType;
  public status: ChatStatus;
  public name: string;
  public description: string;
  public profile: Buffer;
  public users: Users;

  constructor(id: string, type?: ChatType, name?: string, description?: string, profile?: Buffer, users?: Users, status?: ChatStatus) {
    this.id = id;
    this.type = type || "pv";
    this.name = name || "";
    this.description = description || "";
    this.profile = profile || Buffer.from("");
    this.users = users || {};
    this.status = status || "offline";
  }

  /**
   * @param chat Sala de bate-papo que será obtida
   * @returns Retorna a sala de bate-papo
   */
  public static getChat<ChatIn extends IChat>(chat: ChatIn | string): ChatIn | IChat {
    if (typeof chat == "string") {
      return new Chat(chat);
    }

    return chat;
  }

  /**
   * @param chat Sala de bate-papo
   * @returns Retorna o ID da sala de bate-papo
   */
  public static getChatId(chat: IChat | string): string {
    if (typeof chat == "string") {
      return String(chat || "");
    }

    if (typeof chat == "object" && !Array.isArray(chat) && chat?.id) {
      return String(chat.id);
    }

    return String(chat || "");
  }
}

export function GenerateChat<C extends IChat>(bot: Bot, chat: C): C & ChatModule {
  const module: C & ChatModule = {
    ...chat,

    async setName(name: string): Promise<void> {
      this.name = name;

      await bot.setChatName(this, name);
    },

    async getName(): Promise<string> {
      return bot.getChatName(this);
    },

    async getDescription(): Promise<string> {
      return bot.getChatDescription(this);
    },

    async setDescription(description: string): Promise<void> {
      this.description = description;

      return bot.setChatDescription(this, description);
    },

    async getProfile(): Promise<Buffer> {
      return bot.getChatProfile(this);
    },

    async setProfile(image: Buffer): Promise<void> {
      this.profile = image;

      return bot.setChatProfile(this, image);
    },

    async IsAdmin(user: IUser | string): Promise<boolean> {
      const admins = await bot.getChatAdmins(this);

      return admins.hasOwnProperty(User.getUserId(user));
    },

    async IsLeader(user: IUser | string): Promise<boolean> {
      const leader = await bot.getChatLeader(this);

      return leader.id == User.getUserId(user);
    },

    async getAdmins(): Promise<Users> {
      return bot.getChatAdmins(this);
    },

    async addUser(user: IUser | string): Promise<void> {
      return bot.addUserInChat(this, user);
    },

    async removeUser(user: IUser | string): Promise<void> {
      return bot.removeUserInChat(this, user);
    },

    async promote(user: IUser | string): Promise<void> {
      return bot.promoteUserInChat(this, user);
    },

    async demote(user: IUser | string): Promise<void> {
      return bot.demoteUserInChat(this, User.getUser(user));
    },

    async leave(): Promise<void> {
      return bot.leaveChat(this);
    },

    async send(message: IMessage | string): Promise<Message> {
      return bot.send(Message.getMessage(message));
    },

    async changeStatus(status: ChatStatus): Promise<void> {
      return bot.changeChatStatus(this, status);
    },
  };

  for (const id in chat.users) {
    const user = chat.users[id];

    if (!(user instanceof User)) {
      module.users[id] = GenerateUser(bot, chat.users[id]);
    } else {
      module.users[id] = user;
    }
  }

  return module;
}
