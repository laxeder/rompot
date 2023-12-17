import TelegramBotAPI from "node-telegram-bot-api";

import IAuth from "../client/IAuth";

import { ChatStatus } from "../chat/ChatStatus";
import Chat from "../chat/Chat";
import User from "../user/User";

import { BotStatus } from "../bot/BotStatus";
import BotEvents from "../bot/BotEvents";
import IBot from "../bot/IBot";

import ReactionMessage from "../messages/ReactionMessage";
import { Media } from "../messages/MediaMessage";
import Message from "../messages/Message";

import TelegramSendingController from "./TelegramSendingController";
import { TelegramUtils } from "./TelegramUtils";
import TelegramEvents from "./TelegramEvents";
import TelegramAuth from "./TelegramAuth";

export default class TelegramBot extends BotEvents implements IBot {
  public bot: TelegramBotAPI;
  public events: TelegramEvents;
  public options: Partial<TelegramBotAPI.ConstructorOptions>;

  public id: string = "";
  public status: BotStatus = BotStatus.Offline;
  public phoneNumber: string = "";
  public name: string = "";
  public profileUrl: string = "";

  public auth: IAuth = new TelegramAuth("", "", false);

  constructor(options?: Partial<TelegramBotAPI.ConstructorOptions>) {
    super();

    this.options = { ...(options || {}) };

    this.bot = new TelegramBotAPI("", this.options);
    this.events = new TelegramEvents(this);

    this.events.configAll();
  }

  public async connect(auth: string | IAuth): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        this.status = BotStatus.Offline;

        this.emit("connecting", {});

        if (typeof auth == "string") {
          auth = new TelegramAuth(auth);
        }

        this.auth = auth;

        const botToken = await this.auth.get("BOT_TOKEN");

        (this.bot as any).token = botToken;
        (this.bot as any).options = { ...(this.bot as any).options, ...this.options };

        this.bot.startPolling();

        const botInfo = await this.bot.getMe();

        this.id = `${botInfo.id}`;
        this.status = BotStatus.Online;
        this.name = TelegramUtils.getName(botInfo);
        this.phoneNumber = TelegramUtils.getPhoneNumber(this.id);
        this.profileUrl = await this.getBotProfileUrl();

        resolve();

        this.emit("open", { isNewLogin: false });
      } catch (error) {
        reject(error);
      }
    });
  }

  public async reconnect(alert?: boolean): Promise<void> {
    this.status = BotStatus.Offline;

    try {
      await this.bot.close();
    } catch {}

    this.emit("reconnecting", {});

    await this.connect(this.auth);
  }

  public async stop(reason: any): Promise<void> {
    this.status = BotStatus.Offline;

    try {
      await this.bot.close();
    } catch {}

    this.emit("stop", { isLogout: false });
  }

  public async logout(): Promise<void> {
    this.status = BotStatus.Offline;

    try {
      await this.bot.logOut();
    } catch {}

    this.emit("stop", { isLogout: true });
  }

  public async send(message: Message): Promise<Message> {
    return await new TelegramSendingController(this).send(message);
  }

  public async editMessage(message: Message): Promise<void> {
    await new TelegramSendingController(this).sendEditedMessage(message);
  }

  public async addReaction(message: ReactionMessage): Promise<void> {
    await new TelegramSendingController(this).sendReaction(message);
  }

  public async removeReaction(message: ReactionMessage): Promise<void> {
    await new TelegramSendingController(this).sendReaction(message);
  }

  public async readMessage(message: Message): Promise<void> {}

  public async removeMessage(message: Message): Promise<void> {}

  public async deleteMessage(message: Message): Promise<void> {
    await this.bot.deleteMessage(Number(message.chat.id), Number(message.id));
  }

  public async downloadStreamMessage(media: Media): Promise<Buffer> {
    if (!media?.stream || typeof media.stream != "object" || !media.stream.file_id) {
      return Buffer.from("");
    }

    const fileUrl = await this.bot.getFileLink(media.stream.file_id);

    return await TelegramUtils.downloadFileFromURL(fileUrl);
  }

  public async getBotName(): Promise<string> {
    return TelegramUtils.getName(await this.bot.getMe());
  }

  public async setBotName(name: string): Promise<void> {
    await this.setUserName(new User(this.id), name);
  }

  public async getBotDescription(): Promise<string> {
    return await this.getUserDescription(new User(this.id));
  }

  public async setBotDescription(description: string): Promise<void> {
    await this.setUserDescription(new User(this.id), description);
  }

  public async getBotProfile(lowQuality?: boolean): Promise<Buffer> {
    return await this.getUserProfile(new User(this.id));
  }

  public async getBotProfileUrl(lowQuality?: boolean): Promise<string> {
    return await this.getUserProfileUrl(new User(this.id));
  }

  public async setBotProfile(image: Buffer): Promise<void> {
    await this.setUserProfile(new User(this.id), image);
  }

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

  public async leaveChat(chat: Chat): Promise<void> {
    await this.bot.leaveChat(Number(chat.id));
  }

  public async addUserInChat(chat: Chat, user: User): Promise<void> {
    await this.bot.unbanChatMember(Number(chat.id), Number(user.id));
  }

  public async removeUserInChat(chat: Chat, user: User): Promise<void> {
    await this.bot.banChatMember(Number(chat.id), Number(user.id));
  }

  public async promoteUserInChat(chat: Chat, user: User): Promise<void> {
    await this.bot.promoteChatMember(Number(chat.id), Number(user.id));
  }

  public async demoteUserInChat(chat: Chat, user: User): Promise<void> {}

  public async changeChatStatus(chat: Chat, status: ChatStatus): Promise<void> {}

  public async getChatUsers(chat: Chat): Promise<string[]> {
    return [];
  }

  public async getChatAdmins(chat: Chat): Promise<string[]> {
    const members = await this.bot.getChatAdministrators(Number(chat.id));

    return members.map((member) => TelegramUtils.getId(member.user));
  }

  public async getChatLeader(chat: Chat): Promise<string> {
    const members = await this.bot.getChatAdministrators(Number(chat.id));

    return `${members.find((member) => member.status == "creator") || ""}`;
  }

  public async getChatName(chat: Chat): Promise<string> {
    const chatData = await this.bot.getChat(Number(chat.id));

    return `${chatData.title || ""}`;
  }

  public async setChatName(chat: Chat, name: string): Promise<void> {
    await this.bot.setChatTitle(Number(chat.id), `${name}`);
  }

  public async getChatDescription(chat: Chat): Promise<string> {
    const chatData = await this.bot.getChat(Number(chat.id));

    return `${chatData.description || chatData.bio || ""}`;
  }

  public async setChatDescription(chat: Chat, description: string): Promise<void> {
    await this.bot.setChatDescription(Number(chat.id), `${description || ""}`);
  }

  public async getChatProfile(chat: Chat, lowQuality?: boolean): Promise<Buffer> {
    const fileUrl = await this.getChatProfileUrl(chat, lowQuality);

    if (!fileUrl) {
      return Buffer.from("");
    }

    return await TelegramUtils.downloadFileFromURL(fileUrl);
  }

  public async getChatProfileUrl(chat: Chat, lowQuality?: boolean): Promise<string> {
    const profile = await this.bot.getUserProfilePhotos(Number(chat.id));

    const photo = profile.photos?.shift()?.shift();

    if (!photo) {
      return "";
    }

    return await this.bot.getFileLink(photo.file_id);
  }

  public async setChatProfile(chat: Chat, profile: Buffer): Promise<void> {
    await this.bot.setChatPhoto(Number(chat.id), profile);
  }

  public async joinChat(code: string): Promise<void> {}

  public async getChatInvite(chat: Chat): Promise<string> {
    return await this.bot.exportChatInviteLink(Number(chat.id));
  }

  public async revokeChatInvite(chat: Chat): Promise<string> {
    const result = await this.bot.revokeChatInviteLink(Number(chat.id), await this.getChatInvite(chat));

    return result.invite_link;
  }

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
    const chat = await this.bot.getChat(Number(user.id));

    return `${chat.title || ""}`;
  }

  public async setUserName(user: User, name: string): Promise<void> {
    await this.bot.setChatTitle(Number(user.id), `${name || ""}`);
  }

  public async getUserDescription(user: User): Promise<string> {
    const chatData = await this.bot.getChat(Number(user.id));

    return `${chatData.description || chatData.bio || ""}`;
  }

  public async setUserDescription(user: User, description: string): Promise<void> {
    await this.bot.setChatDescription(Number(user.id), `${description || ""}`);
  }

  public async getUserProfile(user: User, lowQuality?: boolean): Promise<Buffer> {
    const fileUrl = await this.getUserProfileUrl(user, lowQuality);

    if (!fileUrl) {
      return Buffer.from("");
    }

    return await TelegramUtils.downloadFileFromURL(fileUrl);
  }

  public async getUserProfileUrl(user: User, lowQuality?: boolean): Promise<string> {
    const profile = await this.bot.getUserProfilePhotos(Number(user.id));

    const photo = profile.photos?.shift()?.shift();

    if (!photo) {
      return "";
    }

    return await this.bot.getFileLink(photo.file_id);
  }

  public async setUserProfile(user: User, profile: Buffer): Promise<void> {
    await this.bot.setChatPhoto(Number(user.id), profile);
  }
}
