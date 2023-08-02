import { BotStatus, ChatStatus, IAuth, IBot, IBotEvents, IChat, IMessage, IReactionMessage, IUser, Media } from "rompot-base";

import BotEvents from "@modules/bot/events/BotEvents";

export default class BotBase implements IBot {
  public id: string = "";
  public status: BotStatus = "offline";
  public ev: IBotEvents = new BotEvents();

  //! #################################################################
  //! ########## MÉTODOS DE CONEXÃO
  //! #################################################################

  public async connect(auth: IAuth): Promise<void> {}

  public async connectByCode(phoneNumber: number | string, auth: string | IAuth): Promise<string> {
    return "";
  }

  public async reconnect(alert?: boolean): Promise<void> {}

  public async stop(reason: any): Promise<void> {}

  //! #################################################################
  //! ########## MÉTODOS DE MENSAGEM
  //! #################################################################

  public async send(message: IMessage): Promise<IMessage> {
    return message;
  }

  public async sendMessage(chat: IChat | string, message: string | IMessage, mention?: IMessage): Promise<IMessage> {
    return new Promise<IMessage>(() => {});
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

  public async getChats(): Promise<Record<string, IChat>> {
    return {};
  }

  public async setChats(chats: Record<string, IChat>): Promise<void> {}

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

  public async getChatUsers(chat: IChat): Promise<Record<string, IUser>> {
    return {};
  }

  public async getChatAdmins(chat: IChat): Promise<Record<string, IUser>> {
    return {};
  }

  public async getChatLeader(chat: IChat): Promise<IUser> {
    return new Promise<IUser>(() => {});
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

  public async getUsers(): Promise<Record<string, IUser>> {
    return {};
  }

  public async setUsers(users: Record<string, IUser>): Promise<void> {}

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
