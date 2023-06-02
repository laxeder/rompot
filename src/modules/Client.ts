import type { IChats, ChatStatus } from "../types/Chat";
import type { IUsers } from "../types/User";

import { readFileSync } from "fs";

import { ConnectionConfig, DefaultConnectionConfig } from "@config/ConnectionConfig";
import { DefaultCommandConfig } from "@config/CommandConfig";

import { IMediaMessage, IMessage } from "@interfaces/IMessage";
import { IClient } from "@interfaces/IClient";
import { IAuth } from "@interfaces/IAuth";
import { IChat } from "@interfaces/IChat";
import { IUser } from "@interfaces/IUser";
import { IBot } from "@interfaces/IBot";

import Command from "@modules/Command";
import User from "@modules/User";
import Chat from "@modules/Chat";

import { sleep, getError, ApplyClient } from "@utils/Generic";
import PromiseMessages from "@utils/PromiseMessages";
import { ClientEvents } from "@utils/Emmiter";

export default class Client<Bot extends IBot> extends ClientEvents implements IClient {
  public promiseMessages: PromiseMessages = new PromiseMessages();
  public autoMessages: any = {};

  public bot: Bot;
  public config: ConnectionConfig;
  public commands: Command[];

  public reconnectTimes: number = 0;

  get id() {
    return this.bot.id;
  }

  get status() {
    return this.bot.status;
  }

  constructor(bot: Bot, config: Partial<ConnectionConfig> = DefaultConnectionConfig, commands: Command[] = []) {
    super();

    this.bot = bot;
    this.setCommands(commands);

    this.config = {
      commandConfig: config.commandConfig || DefaultCommandConfig,
      disableAutoCommand: !!config.disableAutoCommand,
      disableAutoTyping: !!config.disableAutoTyping,
      disableAutoRead: !!config.disableAutoRead,
      maxReconnectTimes: config.maxReconnectTimes || DefaultConnectionConfig.maxReconnectTimes,
      reconnectTimeout: config.reconnectTimeout || DefaultConnectionConfig.reconnectTimeout,
    };

    this.configEvents();
  }

  public configEvents() {
    this.bot.ev.on("message", async (message: IMessage) => {
      try {
        if (!message.fromMe && !this.config.disableAutoRead) await this.readMessage(message);

        if (this.promiseMessages.resolvePromiseMessages(message)) return;

        this.emit("message", ApplyClient(message, this));

        if (this.config.disableAutoCommand) return;

        this.getCommand(message.text)?.execute(ApplyClient(message, this));
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
          chat: Chat.Client(this, update.chat),
          user: User.Client(this, update.user),
          fromUser: User.Client(this, update.fromUser),
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

  public setCommands(commands: Command[]) {
    const cmds: Command[] = [];

    for (const cmd of commands) {
      cmd.client = this;
      cmds.push(cmd);
    }

    this.commands = cmds;
  }

  public getCommands() {
    return this.commands;
  }

  public addCommand(command: Command) {
    command.client = this;
    this.commands.push(command);
  }

  public removeCommand(command: Command) {
    const cmds: Command[] = [];

    for (const cmd of this.commands) {
      if (!!cmd.id || cmd.id == command.id) continue;
      if (!!cmd.tags || cmd.tags == command.tags) continue;
      if (!!cmd.name || cmd.name == command.name) continue;
      if (cmd === command) continue;

      cmds.push(cmd);
    }

    this.commands = cmds;
  }

  public getCommand(command: string | Command): Command | null {
    if (command instanceof Command) {
      let cmd = command;

      for (const c of this.commands) {
        if (!!c.tags || c.tags == cmd.tags || !!c.name || c.name == cmd.name || !!c.id || c.id == cmd.id || c == cmd) {
          cmd = c;
          break;
        }
      }

      cmd.client = this;

      return cmd;
    }

    const cmd = this.config.commandConfig.get(command, this.commands);

    if (!cmd) return null;

    return cmd;
  }

  //! <============================> MESSAGES <============================>

  public deleteMessage(message: IMessage): Promise<void> {
    return this.bot.removeMessage(message);
  }

  public removeMessage(message: IMessage): Promise<void> {
    return this.bot.removeMessage(message);
  }

  public addReaction(message: IMessage, reaction: string): Promise<void> {
    return this.bot.addReaction(message, reaction);
  }

  public removeReaction(message: IMessage): Promise<void> {
    return this.bot.removeReaction(message);
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

  public readMessage(message: IMessage) {
    return this.bot.readMessage(message);
  }

  public async send(message: IMessage): Promise<IMessage> {
    try {
      if (!this.config.disableAutoTyping) {
        await this.changeChatStatus(message.chat, "typing");
      }

      return ApplyClient(await this.bot.send(message), this);
    } catch (err) {
      this.emit("error", getError(err));
    }

    return ApplyClient(message, this);
  }

  public async awaitMessage(chat: IChat | string, ignoreMessageFromMe: boolean = true, stopRead: boolean = true, ...ignoreMessages: IMessage[]): Promise<IMessage> {
    return ApplyClient(await this.promiseMessages.addPromiseMessage(Chat.getId(chat), ignoreMessageFromMe, stopRead, ...ignoreMessages), this);
  }

  async addAutomate(message: IMessage, timeout: number, chats?: IChats, id: string = String(Date.now())): Promise<any> {
    try {
      const now = Date.now();

      // Criar e atualizar dados da mensagem automatizada
      this.autoMessages[id] = { id, chats: chats || (await this.getChats()), updatedAt: now, message };

      // Aguarda o tempo definido
      await sleep(timeout - now);

      // Cancelar se estiver desatualizado
      if (this.autoMessages[id].updatedAt !== now) return;

      await Promise.all(
        this.autoMessages[id].chats.map(async (chat: IChat) => {
          const automated: any = this.autoMessages[id];

          if (automated.updatedAt !== now) return;

          automated.message?.setChat(chat);

          // Enviar mensagem
          await this.send(automated.message);

          // Remover sala de bate-papo da mensagem
          const nowChats = automated.chats;
          const index = nowChats.indexOf(automated.chats[chat.id]);

          this.autoMessages[id].chats = nowChats.splice(index + 1, nowChats.length);
        })
      );
    } catch (err) {
      this.emit("error", getError(err));
    }
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
    const iChat = await this.bot.getChat(Chat.get(chat));

    if (!iChat) return null;

    return Chat.Client(this, Chat.get(chat));
  }

  public setChat(chat: IChat): Promise<void> {
    return this.bot.setChat(Chat.Client(this, chat));
  }

  public async getChats(): Promise<IChats> {
    const modules: IChats = {};

    const chats = await this.bot.getChats();

    for (const id in chats) {
      modules[id] = Chat.Client(this, chats[id]);
    }

    return modules;
  }

  public setChats(chats: IChats): Promise<void> {
    return this.bot.setChats(chats);
  }

  public addChat(chat: string | Chat): Promise<void> {
    return this.bot.addChat(Chat.Client(this, Chat.get(chat)));
  }

  public removeChat(chat: string | Chat): Promise<void> {
    return this.bot.removeChat(Chat.Client(this, Chat.get(chat)));
  }

  public getChatName(chat: IChat | string) {
    return this.bot.getChatName(Chat.get(chat));
  }

  public setChatName(chat: IChat | string, name: string) {
    return this.bot.setChatName(Chat.get(chat), name);
  }

  public getChatDescription(chat: IChat | string) {
    return this.bot.getChatDescription(Chat.get(chat));
  }

  public setChatDescription(chat: IChat | string, description: string) {
    return this.bot.setChatDescription(Chat.get(chat), description);
  }

  public getChatProfile(chat: IChat | string) {
    return this.bot.getChatProfile(Chat.get(chat));
  }

  public setChatProfile(chat: IChat | string, profile: Buffer) {
    return this.bot.setChatProfile(Chat.get(chat), profile);
  }

  public changeChatStatus(chat: IChat | string, status: ChatStatus): Promise<void> {
    return this.bot.changeChatStatus(Chat.get(chat), status);
  }

  public addUserInChat(chat: IChat | string, user: IUser | string) {
    return this.bot.addUserInChat(Chat.get(chat), User.get(user));
  }

  public removeUserInChat(chat: IChat | string, user: IUser | string) {
    return this.bot.removeUserInChat(Chat.get(chat), User.get(user));
  }

  public promoteUserInChat(chat: IChat | string, user: IUser | string) {
    return this.bot.promoteUserInChat(Chat.get(chat), User.get(user));
  }

  public demoteUserInChat(chat: IChat | string, user: User) {
    return this.bot.demoteUserInChat(Chat.get(chat), User.get(user));
  }

  public createChat(chat: IChat) {
    return this.bot.createChat(Chat.get(chat));
  }

  public leaveChat(chat: IChat | string) {
    return this.bot.leaveChat(Chat.get(chat));
  }

  public async getChatUsers(chat: IChat | string) {
    const users = await this.bot.getChatUsers(Chat.get(chat));

    const usersModules: IUsers = {};

    Object.keys(users).forEach((id) => {
      usersModules[id] = User.Client(this, users[id]);
    });

    return usersModules;
  }

  public async getChatAdmins(chat: IChat | string) {
    const admins = await this.bot.getChatAdmins(Chat.get(chat));

    const adminModules: IUsers = {};

    Object.keys(admins).forEach((id) => {
      adminModules[id] = User.Client(this, admins[id]);
    });

    return adminModules;
  }

  public async getChatLeader(chat: IChat | string): Promise<IUser> {
    const leader = await this.bot.getChatLeader(Chat.get(chat));

    return User.Client(this, leader);
  }

  //! <==============================> USER <==============================>

  public async getUser(user: IUser | string): Promise<IUser | null> {
    const usr = await this.bot.getUser(User.get(user));

    if (usr) return User.Client(this, usr);

    return null;
  }

  public setUser(user: IUser | string): Promise<void> {
    return this.bot.setUser(User.Client(this, User.get(user)));
  }

  public async getUsers(): Promise<IUsers> {
    const modules: IUsers = {};

    const users = await this.bot.getUsers();

    for (const id in users) {
      modules[id] = User.Client(this, users[id]);
    }

    return modules;
  }

  public setUsers(users: IUsers) {
    return this.bot.setUsers(users);
  }

  public addUser(user: IUser | string): Promise<void> {
    return this.bot.addUser(User.Client(this, User.get(user)));
  }

  public removeUser(user: IUser | string) {
    return this.bot.removeUser(User.get(user));
  }

  public getUserName(user: IUser | string) {
    if (User.getId(user) == this.id) return this.getBotName();

    return this.bot.getUserName(User.get(user));
  }

  public setUserName(user: IUser | string, name: string) {
    if (User.getId(user) == this.id) return this.setBotName(name);

    return this.bot.setUserName(User.get(user), name);
  }

  public getUserDescription(user: IUser | string) {
    if (User.getId(user) == this.id) return this.getBotDescription();

    return this.bot.getUserDescription(User.get(user));
  }

  public setUserDescription(user: IUser | string, description: string) {
    if (User.getId(user) == this.id) return this.setBotDescription(description);

    return this.bot.setUserDescription(User.get(user), description);
  }

  public getUserProfile(user: IUser | string) {
    if (User.getId(user) == this.id) return this.getBotProfile();

    return this.bot.getUserProfile(User.get(user));
  }

  public setUserProfile(user: IUser | string, profile: Buffer) {
    if (User.getId(user) == this.id) return this.setBotProfile(profile);

    return this.bot.setUserProfile(User.get(user), profile);
  }

  public unblockUser(user: IUser | string) {
    return this.bot.unblockUser(User.get(user));
  }

  public blockUser(user: IUser | string) {
    return this.bot.blockUser(User.get(user));
  }
}
