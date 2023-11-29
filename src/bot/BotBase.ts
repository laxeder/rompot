import ReactionMessage from "../messages/ReactionMessage";
import { Media } from "../messages/MediaMessage";
import { ChatStatus } from "../chat/ChatStatus";
import Message from "../messages/Message";
import { BotStatus } from "./BotStatus";
import IAuth from "../client/IAuth";
import BotEvents from "./BotEvents";
import Chat from "../chat/Chat";
import User from "../user/User";
import IBot from "./IBot";

export default class BotBase extends BotEvents implements IBot {
  public id: string = "";
  public status: BotStatus = BotStatus.Offline;
  public phoneNumber: string = "";
  public name: string = "";
  public profileUrl: string = "";

  //! #################################################################
  //! ########## MÉTODOS DE CONEXÃO
  //! #################################################################

  public async connect(auth: IAuth): Promise<void> {}

  public async connectByCode(phoneNumber: number | string, auth: string | IAuth): Promise<string> {
    return "";
  }

  public async reconnect(alert?: boolean): Promise<void> {}

  public async stop(reason: any): Promise<void> {}

  public async logout(): Promise<void> {}

  //! #################################################################
  //! ########## MÉTODOS DE MENSAGEM
  //! #################################################################

  public async send(message: Message): Promise<Message> {
    return message;
  }

  public async sendMessage(chat: Chat | string, message: string | Message, mention?: Message): Promise<Message> {
    return new Promise<Message>(() => {});
  }

  public async editMessage(message: Message): Promise<void> {}

  public async addReaction(message: ReactionMessage): Promise<void> {}

  public async removeReaction(message: ReactionMessage): Promise<void> {}

  public async readMessage(message: Message): Promise<void> {}

  public async removeMessage(message: Message): Promise<void> {}

  public async deleteMessage(message: Message): Promise<void> {}

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

  public async getBotProfile(lowQuality?: boolean): Promise<Buffer> {
    return Buffer.from("");
  }

  public async getBotProfileUrl(lowQuality?: boolean): Promise<string> {
    return "";
  }

  public async setBotProfile(image: Buffer): Promise<void> {}

  //! #################################################################
  //! ########## MÉTODOS DO CHAT
  //! #################################################################

  public async getChats(): Promise<string[]> {
    return [];
  }

  public async setChats(chats: Chat[]): Promise<void> {}

  public async getChat(chat: Chat): Promise<Chat | null> {
    return null;
  }

  public async updateChat(chat: { id: string } & Partial<Chat>): Promise<void> {}

  public async removeChat(chat: Chat): Promise<void> {}

  public async createChat(chat: Chat): Promise<void> {}

  public async leaveChat(chat: Chat): Promise<void> {}

  public async addUserInChat(chat: Chat, user: User): Promise<void> {}

  public async removeUserInChat(chat: Chat, user: User): Promise<void> {}

  public async promoteUserInChat(chat: Chat, user: User): Promise<void> {}

  public async demoteUserInChat(chat: Chat, user: User): Promise<void> {}

  public async changeChatStatus(chat: Chat, status: ChatStatus): Promise<void> {}

  public async getChatUsers(chat: Chat): Promise<string[]> {
    return [];
  }

  public async getChatAdmins(chat: Chat): Promise<string[]> {
    return [];
  }

  public async getChatLeader(chat: Chat): Promise<string> {
    return "";
  }

  public async getChatName(chat: Chat): Promise<string> {
    return "";
  }

  public async setChatName(chat: Chat, name: string): Promise<void> {}

  public async getChatDescription(chat: Chat): Promise<string> {
    return "";
  }

  public async setChatDescription(chat: Chat, description: string): Promise<void> {}

  public async getChatProfile(chat: Chat, lowQuality?: boolean): Promise<Buffer> {
    return Buffer.from("");
  }

  public async getChatProfileUrl(chat: Chat, lowQuality?: boolean): Promise<string> {
    return "";
  }

  public async setChatProfile(chat: Chat, profile: Buffer): Promise<void> {}

  public async joinChat(code: string): Promise<void> {}

  public async getChatEnvite(chat: Chat): Promise<string> {
    return "";
  }

  public async revokeChatEnvite(chat: Chat): Promise<string> {
    return "";
  }

  //! #################################################################
  //! ########## MÉTODOS DO USUÁRIO
  //! #################################################################

  public async getUsers(): Promise<string[]> {
    return [];
  }

  public async setUsers(users: User[]): Promise<void> {}

  public async getUser(user: User): Promise<User | null> {
    return null;
  }

  public async updateUser(user: { id: string } & Partial<User>): Promise<void> {}

  public async removeUser(user: User): Promise<void> {}

  public async unblockUser(user: User): Promise<void> {}

  public async blockUser(user: User): Promise<void> {}

  public async getUserName(user: User): Promise<string> {
    return "";
  }

  public async setUserName(user: User, name: string): Promise<void> {}

  public async getUserDescription(user: User): Promise<string> {
    return "";
  }

  public async setUserDescription(user: User, description: string): Promise<void> {}

  public async getUserProfile(user: User): Promise<Buffer> {
    return Buffer.from("");
  }

  public async getUserProfileUrl(user: User, lowQuality?: boolean): Promise<string> {
    return "";
  }

  public async setUserProfile(user: User, profile: Buffer): Promise<void> {}
}
