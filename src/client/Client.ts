import { readFileSync } from "fs";

import { DEFAULT_CONNECTION_CONFIG } from "../configs/Defaults";
import ConnectionConfig from "../configs/ConnectionConfig";

import QuickResponseController from "../quickResponse/QuickResponseController";
import Message, { MessageStatus, MessageType } from "../messages/Message";
import ReactionMessage from "../messages/ReactionMessage";
import MediaMessage from "../messages/MediaMessage";
import ErrorMessage from "../messages/ErrorMessage";

import { ChatStatus } from "../chat/ChatStatus";
import Chat from "../chat/Chat";
import User from "../user/User";

import CommandController from "../command/CommandController";
import { CMDRunType } from "../command/CommandEnums";
import Command from "../command/Command";

import ClientEvents, { ClientEventsMap } from "./ClientEvents";
import ClientFunctionHandler from "./ClientFunctionHandler";
import ClientCluster from "../cluster/ClientCluster";
import IClient from "./IClient";
import IAuth from "./IAuth";

import { BotStatus } from "../bot/BotStatus";
import BotBase from "../bot/BotBase";
import IBot from "../bot/IBot";

import MessageHandler, { MessageHandlerConfig } from "../utils/MessageHandler";
import { sleep, getError } from "../utils/Generic";
import QuickResponse from "../quickResponse/QuickResponse";
import { QuickResponseOptions, QuickResponsePattern, QuickResponseReply } from "../quickResponse";

export default class Client<Bot extends IBot = IBot> extends ClientEvents implements IClient {
  public funcHandler = new ClientFunctionHandler(this, { bot: [], chat: [], user: [], message: [], sendMessage: [], sendMediaMessage: [], downloadMedia: [] });
  public commandController: CommandController = new CommandController();
  public quickResponseController: QuickResponseController = new QuickResponseController();
  public messageHandler: MessageHandler = new MessageHandler();
  public reconnectTimes: number = 0;

  public config: ConnectionConfig;
  public bot: Bot;
  public id: string;

  constructor(bot: Bot, config: Partial<ConnectionConfig> = {}) {
    super();

    this.config = { ...DEFAULT_CONNECTION_CONFIG, ...config };
    this.id = Client.generateId();
    this.bot = bot;

    this.configEvents();

    Client.saveClient(this);
  }

  public configEvents() {
    this.bot.on("message", async (message: Message) => {
      try {
        message.inject({ clientId: this.id, botId: this.bot.id });

        if (!message.fromMe && !this.config.disableAutoRead) {
          if (!message.isDeleted && !message.isUpdate) {
            await message.read();
          }
        }

        message.user = (await this.getUser(message.user)) || message.user;
        message.chat = (await this.getChat(message.chat)) || message.chat;

        if (message.timestamp > message.chat.timestamp) {
          message.chat.timestamp = message.timestamp;
        }

        if (message.mention) {
          if (message.mention.chat.id != message.chat.id) {
            message.mention.chat = (await this.getChat(message.mention.chat)) || message.mention.chat;
          } else {
            message.mention.chat = message.chat;
          }

          if (message.mention.user.id != message.user.id) {
            message.mention.user = (await this.getUser(message.mention.user)) || message.mention.user;
          } else {
            message.mention.user = message.user;
          }
        }

        if (this.messageHandler.resolveMessage(message)) return;

        this.emit("message", message);

        if (this.config.disableAutoCommand) return;
        if (this.config.disableAutoCommandForOldMessage && message.isOld) return;
        if (this.config.disableAutoCommandForUnofficialMessage && message.isUnofficial) return;

        await this.quickResponseController.searchAndExecute(message);

        const command = this.searchCommand(message.text);

        if (command != null) {
          this.runCommand(command, message, CMDRunType.Exec);
        }
      } catch (err) {
        this.emit("message", new ErrorMessage(message.chat, err));
      }
    });

    this.bot.on("open", (update) => {
      try {
        this.reconnectTimes = 0;

        this.emit("open", update);
      } catch (err) {
        this.emit("error", getError(err));
      }
    });

    this.bot.on("reconnecting", (update) => {
      try {
        this.emit("reconnecting", update);
      } catch (err) {
        this.emit("error", getError(err));
      }
    });

    this.bot.on("connecting", (update) => {
      try {
        this.emit("connecting", update);
      } catch (err) {
        this.emit("error", getError(err));
      }
    });

    this.bot.on("close", async (update) => {
      try {
        this.emit("close", update);

        if (this.reconnectTimes < this.config.maxReconnectTimes) {
          this.reconnectTimes++;

          await sleep(this.config.reconnectTimeout);

          this.reconnect();
        }
      } catch (err) {
        this.emit("error", getError(err));
      }
    });

    this.bot.on("stop", async (update) => {
      try {
        this.emit("stop", update);
      } catch (err) {
        this.emit("error", getError(err));
      }
    });

    this.bot.on("qr", (qr) => {
      try {
        this.emit("qr", qr);
      } catch (err) {
        this.emit("error", getError(err));
      }
    });

    this.bot.on("code", (code) => {
      try {
        this.emit("code", code);
      } catch (err) {
        this.emit("error", getError(err));
      }
    });

    this.bot.on("chat", (update) => {
      this.emit("chat", { ...update, chat: { ...update.chat, clientId: this.id, botId: this.bot.id } });
    });

    this.bot.on("user", (update) => {
      try {
        this.emit("user", {
          event: update.event,
          action: update.action,
          chat: Chat.apply(update.chat, { clientId: this.id, botId: this.bot.id }),
          user: User.apply(update.user, { clientId: this.id, botId: this.bot.id }),
          fromUser: User.apply(update.fromUser, { clientId: this.id, botId: this.bot.id }),
        });
      } catch (err) {
        this.emit("error", getError(err));
      }
    });

    this.bot.on("error", (err) => {
      try {
        this.emit("error", getError(err));
      } catch (err) {
        this.emit("error", getError(err));
      }
    });
  }

  public async connect(auth: IAuth | string) {
    await this.bot.connect(auth);
  }

  public async reconnect(alert?: boolean) {
    await this.bot.reconnect(alert);
  }

  public async stop(reason?: any) {
    await this.bot.stop(reason);
  }

  public async logout(): Promise<void> {
    await this.bot.logout();
  }

  public async awaitEvent<T extends keyof ClientEventsMap>(eventName: T, maxTimeout?: number): Promise<ClientEventsMap[T]> {
    return new Promise<ClientEventsMap[T]>((res, rej) => {
      let timeout: NodeJS.Timeout;

      if (maxTimeout) {
        timeout = setTimeout(() => {
          rej("Wait event time out");
        }, maxTimeout);
      }

      const listener = (arg: ClientEventsMap[T]) => {
        if (timeout) {
          clearTimeout(timeout);
        }

        this.ev.removeListener(eventName, listener);

        res(arg);
      };

      this.ev.on(eventName, listener);
    });
  }

  public async awaitConnectionOpen(): Promise<void> {
    if (this.bot.status != BotStatus.Online) {
      await this.awaitEvent("open", this.config.maxTimeout);
    }
  }

  public getCommandController(): CommandController {
    if (this.commandController.clientId != this.id) {
      this.commandController.clientId = this.id;
    }

    if (this.commandController.botId != this.bot.id) {
      this.commandController.botId = this.bot.id;
    }

    return this.commandController;
  }

  public setCommandController(controller: CommandController): void {
    controller.botId = this.bot.id;
    controller.clientId = this.id;

    this.commandController = controller;
  }

  public setCommands(commands: Command[]) {
    this.commandController.setCommands(commands);
  }

  public getCommands() {
    return this.commandController.getCommands();
  }

  public addCommand(command: Command): void {
    this.commandController.addCommand(command);
  }

  public removeCommand(command: Command): boolean {
    return this.commandController.removeCommand(command);
  }

  public searchCommand(text: string): Command | null {
    const command = this.commandController.searchCommand(text);

    if (command == null) return null;

    command.clientId = this.id;
    command.botId = this.bot.id;

    return command;
  }

  public runCommand(command: Command, message: Message, type?: string) {
    return this.commandController.runCommand(command, message, type);
  }

  public addQuickResponse(pattern: QuickResponse): QuickResponse;
  public addQuickResponse(pattern: QuickResponsePattern, reply: QuickResponseReply, options?: Partial<QuickResponseOptions>): QuickResponse;
  public addQuickResponse(pattern: QuickResponsePattern[], reply: QuickResponseReply, options?: Partial<QuickResponseOptions>): QuickResponse;
  public addQuickResponse(content: QuickResponse | QuickResponsePattern | QuickResponsePattern[], reply?: QuickResponseReply, options?: Partial<QuickResponseOptions>): QuickResponse {
    if (content instanceof QuickResponse) {
      this.quickResponseController.add(content);

      return content;
    }

    //@ts-ignore
    const quickResponse = new QuickResponse(content, reply, options);

    this.quickResponseController.add(quickResponse);

    return quickResponse;
  }

  public removeQuickResponse(quickResponse: QuickResponse | string): void {
    this.quickResponseController.remove(quickResponse);
  }

  public deleteMessage(message: Message): Promise<void> {
    return this.funcHandler.exec("message", this.bot.deleteMessage, message);
  }

  public removeMessage(message: Message): Promise<void> {
    return this.funcHandler.exec("message", this.bot.removeMessage, message);
  }

  public async readMessage(message: Message): Promise<void> {
    await this.funcHandler.exec("message", this.bot.readMessage, message);

    if (message.status == MessageStatus.Sending || message.status == MessageStatus.Sended || message.status == MessageStatus.Received) {
      if (message.type == MessageType.Audio) {
        message.status = MessageStatus.Played;
      } else {
        message.status = MessageStatus.Readed;
      }
    }

    if (message.timestamp == message.chat.timestamp) {
      message.chat.unreadCount = message.chat.unreadCount - 1 || 0;
    }
  }

  public editMessage(message: Message, text: string): Promise<void> {
    message.text = text;
    message.isEdited = true;

    return this.funcHandler.exec("message", this.bot.editMessage, message);
  }

  public addReaction(message: Message, reaction: string): Promise<void> {
    return this.funcHandler.exec("message", this.bot.addReaction, new ReactionMessage(message.chat, reaction, message, { user: message.user }));
  }

  public removeReaction(message: Message): Promise<void> {
    return this.funcHandler.exec("message", this.bot.removeReaction, new ReactionMessage(message.chat, "", message, { user: message.user }));
  }

  public addAnimatedReaction(message: Message, reactions: string[], interval: number = 2000, maxTimeout: number = 60000): (reactionStop?: string) => Promise<void> {
    let isStoped: boolean = false;
    const now = Date.now();

    const stop = async (reactionStop?: string) => {
      if (isStoped) return;

      isStoped = true;

      if (!!!reactionStop) {
        await this.removeReaction(message);
      } else {
        await this.addReaction(message, reactionStop);
      }
    };

    const addReaction = async (index: number) => {
      if (isStoped || now + maxTimeout < Date.now()) {
        return stop();
      }

      if (reactions[index]) {
        await this.addReaction(message, reactions[index]);
      }

      await sleep(interval);

      addReaction(index + 1 >= reactions.length ? 0 : index + 1);
    };

    addReaction(0);

    return stop;
  }

  public async send(message: Message): Promise<Message> {
    message = Message.apply(message, { clientId: this.id, botId: this.bot.id });

    if (!this.config.disableAutoTyping) {
      await this.changeChatStatus(message.chat, message.type == "audio" ? ChatStatus.Recording : ChatStatus.Typing);
    }

    if (message.hasOwnProperty("file")) {
      return Message.apply(await this.funcHandler.exec("sendMediaMessage", this.bot.send, message), { clientId: this.id, botId: this.bot.id });
    } else {
      return Message.apply(await this.funcHandler.exec("sendMessage", this.bot.send, message), { clientId: this.id, botId: this.bot.id });
    }
  }

  public async sendMessage(chat: Chat | string, message: string | Message, mention?: Message): Promise<Message> {
    if (Message.isValid(message)) {
      message = Message.apply(message, { clientId: this.id, botId: this.bot.id });
      message.chat = Chat.apply(chat, { clientId: this.id, botId: this.bot.id });
      message.mention = mention;

      return await this.send(message);
    }

    return await this.send(new Message(chat, message, { mention }));
  }

  public async awaitMessage(chat: Chat | string, config: Partial<MessageHandlerConfig> = {}): Promise<Message> {
    return Message.apply(await this.messageHandler.addMessage(Chat.getId(chat), config), { clientId: this.id, botId: this.bot.id });
  }

  public async downloadStreamMessage(message: MediaMessage): Promise<Buffer> {
    if (!message.file) return Buffer.from("");

    if (Buffer.isBuffer(message.file)) return message.file;

    if (typeof message.file == "string") {
      return readFileSync(message.file);
    }

    return this.funcHandler.exec("downloadMedia", this.bot.downloadStreamMessage, message.file);
  }

  public getBotName(): Promise<string> {
    return this.funcHandler.exec("bot", this.bot.getBotName);
  }

  public setBotName(name: string) {
    return this.funcHandler.exec("bot", this.bot.setBotName, name);
  }

  public getBotDescription() {
    return this.funcHandler.exec("bot", this.bot.getBotDescription);
  }

  public setBotDescription(description: string) {
    return this.funcHandler.exec("bot", this.bot.setBotDescription, description);
  }

  public getBotProfile(lowQuality?: boolean) {
    return this.funcHandler.exec("bot", this.bot.getBotProfile, lowQuality);
  }

  public setBotProfile(profile: Buffer) {
    return this.funcHandler.exec("bot", this.bot.setBotProfile, profile);
  }

  public async getChat(chat: Chat | string): Promise<Chat | null> {
    const chatData = await this.funcHandler.exec("chat", this.bot.getChat, Chat.apply(chat, { clientId: this.id, botId: this.bot.id }));

    if (chatData == null) return null;

    return Chat.apply(chatData, { clientId: this.id, botId: this.bot.id });
  }

  public updateChat(id: string, chat: Partial<Chat>): Promise<void> {
    return this.funcHandler.exec("chat", this.bot.updateChat, { ...chat, id });
  }

  public async getChats(): Promise<Chat[]> {
    const ids: string[] = await this.funcHandler.exec("chat", this.bot.getChats);
    const chats: Chat[] = [];

    await Promise.all(
      ids.map(async (id) => {
        const chat = await this.funcHandler.exec("chat", this.bot.getChat, new Chat(id));

        if (chat == null) return;

        chats.push(Chat.apply(chat, { clientId: this.id, botId: this.bot.id }));
      })
    );

    return chats;
  }

  public setChats(chats: Chat[]): Promise<void> {
    return this.funcHandler.exec("chat", this.bot.setChats, chats);
  }

  public removeChat(chat: string | Chat): Promise<void> {
    return this.funcHandler.exec("chat", this.bot.removeChat, Chat.apply(chat, { clientId: this.id, botId: this.bot.id }));
  }

  public createChat(chat: Chat) {
    return this.funcHandler.exec("chat", this.bot.createChat, Chat.apply(chat, { clientId: this.id, botId: this.bot.id }));
  }

  public leaveChat(chat: Chat | string) {
    return this.funcHandler.exec("chat", this.bot.leaveChat, Chat.apply(chat, { clientId: this.id, botId: this.bot.id }));
  }

  public getChatName(chat: Chat | string) {
    return this.funcHandler.exec("chat", this.bot.getChatName, Chat.apply(chat, { clientId: this.id, botId: this.bot.id }));
  }

  public setChatName(chat: Chat | string, name: string) {
    return this.funcHandler.exec("chat", this.bot.setChatName, Chat.apply(chat, { clientId: this.id, botId: this.bot.id }), name);
  }

  public getChatDescription(chat: Chat | string) {
    return this.funcHandler.exec("chat", this.bot.getChatDescription, Chat.apply(chat, { clientId: this.id, botId: this.bot.id }));
  }

  public setChatDescription(chat: Chat | string, description: string) {
    return this.funcHandler.exec("chat", this.bot.setChatDescription, Chat.apply(chat, { clientId: this.id, botId: this.bot.id }), description);
  }

  public getChatProfile(chat: Chat | string, lowQuality?: boolean) {
    return this.funcHandler.exec("chat", this.bot.getChatProfile, Chat.apply(chat, { clientId: this.id, botId: this.bot.id }), lowQuality);
  }

  public setChatProfile(chat: Chat | string, profile: Buffer) {
    return this.funcHandler.exec("chat", this.bot.setChatProfile, Chat.apply(chat, { clientId: this.id, botId: this.bot.id }), profile);
  }

  public async getChatLeader(chat: Chat | string): Promise<User> {
    return User.apply(await this.funcHandler.exec("chat", this.bot.getChatLeader, Chat.apply(chat, { clientId: this.id, botId: this.bot.id })), { clientId: this.id, botId: this.bot.id });
  }

  public async getChatUsers(chat: Chat | string): Promise<string[]> {
    return await this.funcHandler.exec("chat", this.bot.getChatUsers, Chat.apply(chat, { clientId: this.id, botId: this.bot.id }));
  }

  public async getChatAdmins(chat: Chat | string): Promise<string[]> {
    return await this.funcHandler.exec("chat", this.bot.getChatAdmins, Chat.apply(chat, { clientId: this.id, botId: this.bot.id }));
  }

  public addUserInChat(chat: Chat | string, user: User | string) {
    return this.funcHandler.exec("chat", this.bot.addUserInChat, Chat.apply(chat, { clientId: this.id, botId: this.bot.id }), User.apply(user, { clientId: this.id, botId: this.bot.id }));
  }

  public removeUserInChat(chat: Chat | string, user: User | string) {
    return this.funcHandler.exec("chat", this.bot.removeUserInChat, Chat.apply(chat, { clientId: this.id, botId: this.bot.id }), User.apply(user, { clientId: this.id, botId: this.bot.id }));
  }

  public promoteUserInChat(chat: Chat | string, user: User | string) {
    return this.funcHandler.exec("chat", this.bot.promoteUserInChat, Chat.apply(chat, { clientId: this.id, botId: this.bot.id }), User.apply(user, { clientId: this.id, botId: this.bot.id }));
  }

  public demoteUserInChat(chat: Chat | string, user: User | string) {
    return this.funcHandler.exec("chat", this.bot.demoteUserInChat, Chat.apply(chat, { clientId: this.id, botId: this.bot.id }), User.apply(user, { clientId: this.id, botId: this.bot.id }));
  }

  public changeChatStatus(chat: Chat | string, status: ChatStatus): Promise<void> {
    return this.funcHandler.exec("chat", this.bot.changeChatStatus, Chat.apply(chat, { clientId: this.id, botId: this.bot.id }), status);
  }

  public joinChat(code: string): Promise<void> {
    return this.funcHandler.exec("chat", this.bot.joinChat, code);
  }

  public getChatInvite(chat: Chat | string): Promise<string> {
    return this.funcHandler.exec("chat", this.bot.getChatInvite, Chat.apply(chat, { clientId: this.id, botId: this.bot.id }));
  }

  public revokeChatInvite(chat: Chat | string): Promise<string> {
    return this.funcHandler.exec("chat", this.bot.revokeChatInvite, Chat.apply(chat, { clientId: this.id, botId: this.bot.id }));
  }

  public async getUsers(): Promise<User[]> {
    const ids: string[] = await this.funcHandler.exec("user", this.bot.getUsers);
    const users: User[] = [];

    await Promise.all(
      ids.map(async (id) => {
        const user = await this.funcHandler.exec("user", this.bot.getUser, new User(id));

        if (user == null) return;

        users.push(User.apply(user, { clientId: this.id, botId: this.bot.id }));
      })
    );

    return users;
  }

  public async getSavedUsers(): Promise<User[]> {
    const ids: string[] = await this.funcHandler.exec("user", this.bot.getUsers);
    const users: User[] = [];

    await Promise.all(
      ids.map(async (id) => {
        const user = await this.funcHandler.exec("user", this.bot.getUser, new User(id));

        if (user == null || !user.savedName) return;

        users.push(User.apply(user, { clientId: this.id, botId: this.bot.id }));
      })
    );

    return users;
  }

  public setUsers(users: User[]) {
    return this.funcHandler.exec("user", this.bot.setUsers, users);
  }

  public async getUser(user: User | string): Promise<User | null> {
    const userData = await this.funcHandler.exec("user", this.bot.getUser, User.apply(user, { clientId: this.id, botId: this.bot.id }));

    if (userData == null) return null;

    return User.apply(userData, { clientId: this.id, botId: this.bot.id });
  }

  public updateUser(id: string, user: Partial<User>): Promise<void> {
    return this.funcHandler.exec("user", this.bot.updateUser, { ...user, id });
  }

  public removeUser(user: User | string) {
    return this.funcHandler.exec("user", this.bot.removeUser, User.apply(user, { clientId: this.id, botId: this.bot.id }));
  }

  public getUserName(user: User | string) {
    if (User.getId(user) == this.id) return this.getBotName();

    return this.funcHandler.exec("user", this.bot.getUserName, User.apply(user, { clientId: this.id, botId: this.bot.id }));
  }

  public setUserName(user: User | string, name: string) {
    if (User.getId(user) == this.id) return this.setBotName(name);

    return this.funcHandler.exec("user", this.bot.setUserName, User.apply(user, { clientId: this.id, botId: this.bot.id }), name);
  }

  public getUserDescription(user: User | string) {
    if (User.getId(user) == this.id) return this.getBotDescription();

    return this.funcHandler.exec("user", this.bot.getUserDescription, User.apply(user, { clientId: this.id, botId: this.bot.id }));
  }

  public setUserDescription(user: User | string, description: string) {
    if (User.getId(user) == this.id) return this.setBotDescription(description);

    return this.funcHandler.exec("user", this.bot.setUserDescription, User.apply(user, { clientId: this.id, botId: this.bot.id }), description);
  }

  public getUserProfile(user: User | string, lowQuality?: boolean) {
    if (User.getId(user) == this.id) return this.getBotProfile(lowQuality);

    return this.funcHandler.exec("user", this.bot.getUserProfile, User.apply(user, { clientId: this.id, botId: this.bot.id }), lowQuality);
  }

  public setUserProfile(user: User | string, profile: Buffer) {
    if (User.getId(user) == this.id) return this.setBotProfile(profile);

    return this.funcHandler.exec("user", this.bot.setUserProfile, User.apply(user, { clientId: this.id, botId: this.bot.id }), profile);
  }

  public unblockUser(user: User | string) {
    return this.funcHandler.exec("user", this.bot.unblockUser, User.apply(user, { clientId: this.id, botId: this.bot.id }));
  }

  public blockUser(user: User | string) {
    return this.funcHandler.exec("user", this.bot.blockUser, User.apply(user, { clientId: this.id, botId: this.bot.id }));
  }

  public static getClients(): Record<string, Client<IBot>> {
    if (!global.hasOwnProperty("rompot-clients") || typeof global["rompot-clients"] != "object") {
      global["rompot-clients"] = {};
    }

    return global["rompot-clients"];
  }

  public static saveClients(clients: Record<string, Client<IBot>>): void {
    global["rompot-clients"] = clients;
  }

  public static getClient(id: string): Client<IBot> {
    const clients = Client.getClients();

    if (clients.hasOwnProperty(id) && typeof clients[id] == "object") {
      return clients[id];
    }

    if (global["default-rompot-worker"] || global["rompot-cluster-save"]?.worker) {
      return ClientCluster.getClient(id);
    }

    return new Client(new BotBase());
  }

  public static saveClient(client: Client<IBot>): void {
    if (!global.hasOwnProperty("rompot-clients") || typeof global["rompot-clients"] != "object") {
      global["rompot-clients"] = {};
    }

    global["rompot-clients"][client.id] = client;
  }

  public static generateId(): string {
    return `${process.pid}-${Date.now()}-${Object.keys(Client.getClients()).length}`;
  }
}
