import TelegramBotAPI from "node-telegram-bot-api";

import IAuth from "../client/IAuth";

import { ChatStatus } from "../chat/ChatStatus";
import Chat from "../chat/Chat";
import User from "../user/User";

import { BotStatus } from "../bot/BotStatus";
import BotEvents from "../bot/BotEvents";
import IBot from "../bot/IBot";

import MediaMessage, { Media } from "../messages/MediaMessage";
import ReactionMessage from "../messages/ReactionMessage";
import Message from "../messages/Message";

import TelegramToRompotConverter from "./TelegramToRompotConverter";
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

        const profile = await this.bot.getUserProfilePhotos(Number(this.id));

        const photo = profile.photos?.shift()?.shift();

        if (photo) {
          this.profileUrl = await this.bot.getFileLink(photo.file_id);
        }

        resolve();

        this.emit("open", { isNewLogin: false });
      } catch (error) {
        reject(error);
      }
    });
  }

  public async reconnect(alert?: boolean): Promise<void> {}

  public async stop(reason: any): Promise<void> {}

  public async logout(): Promise<void> {}

  public async send(message: Message): Promise<Message> {
    const telegramMessage = await this.bot.sendMessage(Number(message.chat.id), message.text);

    const converter = new TelegramToRompotConverter(telegramMessage);

    const rompotMessage = await converter.convert();

    return rompotMessage;
  }

  public async editMessage(message: Message): Promise<void> {
    const entities = message.mentions.reduce((entities, mention) => {
      const result = new RegExp(`@(${mention})`).exec(message.text);

      const searchedMention = result.shift();

      if (searchedMention) {
        entities.push({ type: "mention", offset: result.index, length: searchedMention.length });
      }

      return entities;
    }, [] as TelegramBotAPI.MessageEntity[]);

    const options: TelegramBotAPI.EditMessageTextOptions = {
      chat_id: Number(message.chat.id || 0),
      message_id: Number(message.id),
      caption_entities: entities,
    };

    if (MediaMessage.isValid(message)) {
      await this.bot.editMessageCaption(message.text, options);
    } else {
      await this.bot.editMessageText(message.text, options);
    }
  }

  public async addReaction(message: ReactionMessage): Promise<void> {}

  public async removeReaction(message: ReactionMessage): Promise<void> {}

  public async readMessage(message: Message): Promise<void> {}

  public async removeMessage(message: Message): Promise<void> {}

  public async deleteMessage(message: Message): Promise<void> {}

  public async downloadStreamMessage(media: Media): Promise<Buffer> {
    return Buffer.from("");
  }

  public async getBotName(): Promise<string> {
    return TelegramUtils.getName(await this.bot.getMe());
  }

  public async setBotName(name: string): Promise<void> {}

  public async getBotDescription(): Promise<string> {
    return "";
  }

  public async setBotDescription(description: string): Promise<void> {}

  public async getBotProfile(lowQuality?: boolean): Promise<Buffer> {
    const fileUrl = await this.getBotProfileUrl();

    if (!fileUrl) {
      return Buffer.from("");
    }

    return await TelegramUtils.downloadFileFromURL(fileUrl);
  }

  public async getBotProfileUrl(lowQuality?: boolean): Promise<string> {
    const profile = await this.bot.getUserProfilePhotos(Number(this.id));

    const photo = profile.photos?.shift()?.shift();

    if (!photo) {
      return "";
    }

    return await this.bot.getFileLink(photo.file_id);
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
