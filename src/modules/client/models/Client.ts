import {
  BotStatus,
  ChatStatus,
  CMDRunType,
  ConnectionConfig,
  IAuth,
  IBot,
  IChat,
  IClient,
  ICommand,
  ICommandController,
  IMediaMessage,
  IMessage,
  IPromiseMessage,
  IUser,
  PromiseMessageConfig,
} from "rompot-base";

import { readFileSync } from "fs";

import { DEFAULT_CONNECTION_CONFIG } from "@config/Defaults";

import ReactionMessage from "@messages/ReactionMessage";
import Message from "@messages/Message";

import ClientEvents from "@modules/client/events/ClientEvents";
import { CommandController } from "@modules/command";
import { ChatUtils } from "@modules/chat";
import { UserUtils } from "@modules/user";

import PromiseMessages from "@utils/PromiseMessages";
import { sleep, getError } from "@utils/Generic";
import MessageUtils from "@utils/MessageUtils";
import { isMessage } from "@utils/Verify";

export default class Client<Bot extends IBot> extends ClientEvents implements IClient {
  public promiseMessages: IPromiseMessage = new PromiseMessages();
  public autoMessages: any = {};

  public bot: Bot;
  public config: ConnectionConfig;
  public commandController: ICommandController = new CommandController(this);

  public reconnectTimes: number = 0;

  get id() {
    return this.bot.id;
  }

  set id(id: string) {
    this.bot.id = id;
  }

  get status() {
    return this.bot.status;
  }

  set status(status: BotStatus) {
    this.bot.status = status;
  }

  constructor(bot: Bot, config: Partial<ConnectionConfig> = {}) {
    super();

    this.bot = bot;

    this.config = { ...DEFAULT_CONNECTION_CONFIG, ...config };

    this.configEvents();
  }

  public configEvents() {
    this.bot.ev.on("message", async (message: IMessage) => {
      try {
        if (!message.fromMe && !this.config.disableAutoRead) await this.readMessage(message);

        if (this.promiseMessages.resolvePromiseMessages(message)) return;

        message = MessageUtils.applyClient(this, message);

        this.emit("message", message);

        if (this.config.disableAutoCommand || message.apiSend) return;

        const command = this.searchCommand(message.text);

        if (command != null) {
          this.runCommand(command, message, CMDRunType.Exec);
        }
      } catch (err) {
        this.emit("error", getError(err));
      }
    });

    this.bot.ev.on("conn", (update) => {
      try {
        this.emit("conn", update);
      } catch (err) {
        this.emit("error", getError(err));
      }
    });

    this.bot.ev.on("open", (update) => {
      try {
        this.reconnectTimes = 0;

        this.emit("open", update);
      } catch (err) {
        this.emit("error", getError(err));
      }
    });

    this.bot.ev.on("reconnecting", (update) => {
      try {
        this.emit("reconnecting", update);
      } catch (err) {
        this.emit("error", getError(err));
      }
    });

    this.bot.ev.on("connecting", (update) => {
      try {
        this.emit("connecting", update);
      } catch (err) {
        this.emit("error", getError(err));
      }
    });

    this.bot.ev.on("close", async (update) => {
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

    this.bot.ev.on("stop", async (update) => {
      try {
        this.emit("stop", update);
      } catch (err) {
        this.emit("error", getError(err));
      }
    });

    this.bot.ev.on("qr", (qr) => {
      try {
        this.emit("qr", qr);
      } catch (err) {
        this.emit("error", getError(err));
      }
    });

    this.bot.ev.on("user", (update) => {
      try {
        this.emit("user", {
          event: update.event,
          action: update.action,
          chat: ChatUtils.applyClient(this, update.chat),
          user: UserUtils.applyClient(this, update.user),
          fromUser: UserUtils.applyClient(this, update.fromUser),
        });
      } catch (err) {
        this.emit("error", getError(err));
      }
    });

    this.bot.ev.on("error", (err) => {
      try {
        this.emit("error", getError(err));
      } catch (err) {
        this.emit("error", getError(err));
      }
    });
  }

  //! <===========================> CONNECTION <===========================>

  public connect(auth: IAuth | string) {
    return this.bot.connect(auth);
  }

  public reconnect(alert?: boolean) {
    return this.bot.reconnect(alert);
  }

  public stop(reason?: any) {
    return this.bot.stop(reason);
  }

  //! <============================> COMMANDS <============================>

  public setCommands(commands: ICommand[]) {
    this.commandController.setCommands(commands);
  }

  public getCommands() {
    return this.commandController.getCommands();
  }

  public addCommand(command: ICommand): void {
    this.commandController.addCommand(command);
  }

  public removeCommand(command: ICommand): boolean {
    return this.commandController.removeCommand(command);
  }

  public searchCommand(text: string): ICommand | null {
    const command = this.commandController.searchCommand(text);

    if (command == null) return null;

    command.client = this;

    return command;
  }

  public runCommand(command: ICommand, message: IMessage, type?: string) {
    return this.commandController.runCommand(command, message, type);
  }

  //! <============================> MESSAGES <============================>

  public deleteMessage(message: IMessage): Promise<void> {
    return this.bot.removeMessage(message);
  }

  public removeMessage(message: IMessage): Promise<void> {
    return this.bot.removeMessage(message);
  }

  public readMessage(message: IMessage) {
    return this.bot.readMessage(message);
  }

  public editMessage(message: IMessage, text: string): Promise<void> {
    message.text = text;
    message.isEdited = true;

    return this.bot.editMessage(message);
  }

  public addReaction(message: IMessage, reaction: string): Promise<void> {
    return this.bot.addReaction(new ReactionMessage(message.chat, reaction, message));
  }

  public removeReaction(message: IMessage): Promise<void> {
    return this.bot.removeReaction(new ReactionMessage(message.chat, "", message));
  }

  public addAnimatedReaction(message: IMessage, reactions: string[], interval: number = 2000, maxTimeout: number = 60000): (reactionStop?: string) => Promise<void> {
    var isStoped: boolean = false;
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

  public async send(message: IMessage): Promise<IMessage> {
    try {
      if (!this.config.disableAutoTyping) {
        await this.changeChatStatus(message.chat, "typing");
      }

      return MessageUtils.applyClient(this, await this.bot.send(message));
    } catch (err) {
      this.emit("error", getError(err));
    }

    return MessageUtils.applyClient(this, message);
  }

  public async sendMessage(chat: IChat | string, message: string | IMessage, mention?: IMessage): Promise<IMessage> {
    if (isMessage(message)) {
      message.chat = ChatUtils.get(chat);
      message.mention = mention;

      return await this.send(message);
    }

    return await this.send(new Message(chat, message, { mention }));
  }

  public async awaitMessage(chat: IChat | string, config: Partial<PromiseMessageConfig> = {}): Promise<IMessage> {
    return MessageUtils.applyClient(this, await this.promiseMessages.addPromiseMessage(ChatUtils.getId(chat), config));
  }

  /**
   * * Retorna a stream da mídia
   * @param message Mídia que será baixada
   * @returns Stream da mídia
   */
  async downloadStreamMessage(message: IMediaMessage): Promise<Buffer> {
    if (!!!message.file) return Buffer.from("");

    if (Buffer.isBuffer(message.file)) return message.file;

    if (typeof message.file == "string") {
      return readFileSync(message.file);
    }

    return this.bot.downloadStreamMessage(message.file);
  }

  //! <===============================> BOT <==============================>

  public getBotName() {
    return this.bot.getBotName();
  }

  public setBotName(name: string) {
    return this.bot.setBotName(name);
  }

  public getBotDescription() {
    return this.bot.getBotDescription();
  }

  public setBotDescription(description: string) {
    return this.bot.setBotDescription(description);
  }

  public getBotProfile() {
    return this.bot.getBotProfile();
  }

  public setBotProfile(profile: Buffer) {
    return this.bot.setBotProfile(profile);
  }

  //! <==============================> CHAT <==============================>

  public async getChat(chat: IChat | string): Promise<IChat | null> {
    const iChat = await this.bot.getChat(ChatUtils.get(chat));

    if (!iChat) return null;

    return ChatUtils.applyClient(this, ChatUtils.get(chat));
  }

  public setChat(chat: IChat): Promise<void> {
    return this.bot.setChat(ChatUtils.applyClient(this, chat));
  }

  public async getChats(): Promise<Record<string, IChat>> {
    const modules: Record<string, IChat> = {};

    const chats = await this.bot.getChats();

    for (const id in chats) {
      modules[id] = ChatUtils.applyClient(this, chats[id]);
    }

    return modules;
  }

  public setChats(chats: Record<string, IChat>): Promise<void> {
    return this.bot.setChats(chats);
  }

  public addChat(chat: string | IChat): Promise<void> {
    return this.bot.addChat(ChatUtils.applyClient(this, ChatUtils.get(chat)));
  }

  public removeChat(chat: string | IChat): Promise<void> {
    return this.bot.removeChat(ChatUtils.applyClient(this, ChatUtils.get(chat)));
  }

  public getChatName(chat: IChat | string) {
    return this.bot.getChatName(ChatUtils.get(chat));
  }

  public setChatName(chat: IChat | string, name: string) {
    return this.bot.setChatName(ChatUtils.get(chat), name);
  }

  public getChatDescription(chat: IChat | string) {
    return this.bot.getChatDescription(ChatUtils.get(chat));
  }

  public setChatDescription(chat: IChat | string, description: string) {
    return this.bot.setChatDescription(ChatUtils.get(chat), description);
  }

  public getChatProfile(chat: IChat | string) {
    return this.bot.getChatProfile(ChatUtils.get(chat));
  }

  public setChatProfile(chat: IChat | string, profile: Buffer) {
    return this.bot.setChatProfile(ChatUtils.get(chat), profile);
  }

  public changeChatStatus(chat: IChat | string, status: ChatStatus): Promise<void> {
    return this.bot.changeChatStatus(ChatUtils.get(chat), status);
  }

  public addUserInChat(chat: IChat | string, user: IUser | string) {
    return this.bot.addUserInChat(ChatUtils.get(chat), UserUtils.get(user));
  }

  public removeUserInChat(chat: IChat | string, user: IUser | string) {
    return this.bot.removeUserInChat(ChatUtils.get(chat), UserUtils.get(user));
  }

  public promoteUserInChat(chat: IChat | string, user: IUser | string) {
    return this.bot.promoteUserInChat(ChatUtils.get(chat), UserUtils.get(user));
  }

  public demoteUserInChat(chat: IChat | string, user: IUser) {
    return this.bot.demoteUserInChat(ChatUtils.get(chat), UserUtils.get(user));
  }

  public createChat(chat: IChat) {
    return this.bot.createChat(ChatUtils.get(chat));
  }

  public leaveChat(chat: IChat | string) {
    return this.bot.leaveChat(ChatUtils.get(chat));
  }

  public async getChatUsers(chat: IChat | string) {
    const users = await this.bot.getChatUsers(ChatUtils.get(chat));

    const usersModules: Record<string, IUser> = {};

    Object.keys(users).forEach((id) => {
      usersModules[id] = UserUtils.applyClient(this, users[id]);
    });

    return usersModules;
  }

  public async getChatAdmins(chat: IChat | string) {
    const admins = await this.bot.getChatAdmins(ChatUtils.get(chat));

    const adminModules: Record<string, IUser> = {};

    Object.keys(admins).forEach((id) => {
      adminModules[id] = UserUtils.applyClient(this, admins[id]);
    });

    return adminModules;
  }

  public async getChatLeader(chat: IChat | string): Promise<IUser> {
    const leader = await this.bot.getChatLeader(ChatUtils.get(chat));

    return UserUtils.applyClient(this, leader);
  }

  //! <==============================> USER <==============================>

  public async getUser(user: IUser | string): Promise<IUser | null> {
    const usr = await this.bot.getUser(UserUtils.get(user));

    if (usr) return UserUtils.applyClient(this, usr);

    return null;
  }

  public setUser(user: IUser | string): Promise<void> {
    return this.bot.setUser(UserUtils.applyClient(this, UserUtils.get(user)));
  }

  public async getUsers(): Promise<Record<string, IUser>> {
    const modules: Record<string, IUser> = {};

    const users = await this.bot.getUsers();

    for (const id in users) {
      modules[id] = UserUtils.applyClient(this, users[id]);
    }

    return modules;
  }

  public setUsers(users: Record<string, IUser>) {
    return this.bot.setUsers(users);
  }

  public addUser(user: IUser | string): Promise<void> {
    return this.bot.addUser(UserUtils.applyClient(this, UserUtils.get(user)));
  }

  public removeUser(user: IUser | string) {
    return this.bot.removeUser(UserUtils.get(user));
  }

  public getUserName(user: IUser | string) {
    if (UserUtils.getId(user) == this.id) return this.getBotName();

    return this.bot.getUserName(UserUtils.get(user));
  }

  public setUserName(user: IUser | string, name: string) {
    if (UserUtils.getId(user) == this.id) return this.setBotName(name);

    return this.bot.setUserName(UserUtils.get(user), name);
  }

  public getUserDescription(user: IUser | string) {
    if (UserUtils.getId(user) == this.id) return this.getBotDescription();

    return this.bot.getUserDescription(UserUtils.get(user));
  }

  public setUserDescription(user: IUser | string, description: string) {
    if (UserUtils.getId(user) == this.id) return this.setBotDescription(description);

    return this.bot.setUserDescription(UserUtils.get(user), description);
  }

  public getUserProfile(user: IUser | string) {
    if (UserUtils.getId(user) == this.id) return this.getBotProfile();

    return this.bot.getUserProfile(UserUtils.get(user));
  }

  public setUserProfile(user: IUser | string, profile: Buffer) {
    if (UserUtils.getId(user) == this.id) return this.setBotProfile(profile);

    return this.bot.setUserProfile(UserUtils.get(user), profile);
  }

  public unblockUser(user: IUser | string) {
    return this.bot.unblockUser(UserUtils.get(user));
  }

  public blockUser(user: IUser | string) {
    return this.bot.blockUser(UserUtils.get(user));
  }
}
