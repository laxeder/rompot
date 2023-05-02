import { readFileSync } from "fs";

import { ConnectionConfig, DefaultConnectionConfig } from "@config/ConnectionConfig";
import { DefaultCommandConfig } from "@config/CommandConfig";

import { IClient } from "@interfaces/IClient";
import Command from "@modules/Command";
import IAuth from "@interfaces/IAuth";
import IBot from "@interfaces/IBot";

import MediaMessage from "@messages/MediaMessage";
import Message from "@messages/Message";

import User from "@modules/User";
import Chat from "@modules/Chat";

import PromiseMessages from "@utils/PromiseMessages";
import { sleep, getError } from "@utils/Generic";
import { ClientEvents } from "@utils/Emmiter";

import { Chats, ChatStatus } from "../types/Chat";
import { Users } from "../types/User";

export default class Client<Bot extends IBot> extends ClientEvents implements IClient {
  public promiseMessages: PromiseMessages = new PromiseMessages();
  public autoMessages: any = {};

  public bot: Bot;
  public config: ConnectionConfig;
  public commands: Command[];

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
    };

    this.configEvents();
  }

  public configEvents() {
    this.bot.ev.on("message", async (message: Message) => {
      try {
        if (!message.fromMe && !this.config.disableAutoRead) await this.readMessage(message);

        if (this.promiseMessages.resolvePromiseMessages(message)) return;

        this.emit("message", Message.Client(this, message));

        if (this.config.disableAutoCommand) return;

        this.getCommand(message.text)?.execute(Message.Client(this, message));
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

    this.bot.ev.on("closed", (update) => {
      try {
        this.emit("closed", update);
      } catch (err) {
        this.emit("error", getError(err));
      }
    });

    this.bot.ev.on("close", (update) => {
      try {
        this.emit("close", update);
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

  public deleteMessage(message: Message): Promise<void> {
    return this.bot.removeMessage(message);
  }

  public removeMessage(message: Message): Promise<void> {
    return this.bot.removeMessage(message);
  }

  public addReaction(message: Message, reaction: string): Promise<void> {
    return this.bot.addReaction(message, reaction);
  }

  public removeReaction(message: Message): Promise<void> {
    return this.bot.removeReaction(message);
  }

  public addAnimatedReaction(message: Message, reactions: string[], interval: number = 2000, maxTimeout: number = 60000): (reactionStop?: string) => Promise<void> {
    var isStoped: boolean = false;
    const now = Date.now();

    const stop = async (reactionStop?: string) => {
      if (isStoped) return;

      if (!!!reactionStop) {
        await this.removeReaction(message);
      } else {
        await this.addReaction(message, reactionStop);
      }

      isStoped = true;
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

  public readMessage(message: Message) {
    return this.bot.readMessage(message);
  }

  public async send(message: Message): Promise<Message> {
    try {
      if (!this.config.disableAutoTyping) {
        await this.changeChatStatus(message.chat, "typing");
      }

      return Message.Client(this, await this.bot.send(message));
    } catch (err) {
      this.emit("error", getError(err));
    }

    return Message.Client(this, message);
  }

  public async awaitMessage(chat: Chat | string, ignoreMessageFromMe: boolean = true, stopRead: boolean = true, ...ignoreMessages: Message[]): Promise<Message> {
    return Message.Client(this, await this.promiseMessages.addPromiseMessage(Chat.getId(chat), ignoreMessageFromMe, stopRead, ...ignoreMessages));
  }

  async addAutomate(message: Message, timeout: number, chats?: Chats, id: string = String(Date.now())): Promise<any> {
    try {
      const now = Date.now();

      // Criar e atualizar dados da mensagem automatizada
      this.autoMessages[id] = { id, chats: chats || (await this.getChats()), updatedAt: now, message };

      // Aguarda o tempo definido
      await sleep(timeout - now);

      // Cancelar se estiver desatualizado
      if (this.autoMessages[id].updatedAt !== now) return;

      await Promise.all(
        this.autoMessages[id].chats.map(async (chat: Chat) => {
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
  async downloadStreamMessage(message: MediaMessage): Promise<Buffer> {
    if (!!!message.file) return Buffer.from("");

    if (typeof message.file == "string") {
      return readFileSync(message.file);
    }

    if (Buffer.isBuffer(message.file)) return message.file;

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

  public async getChat(chat: Chat | string): Promise<Chat | null> {
    const iChat = await this.bot.getChat(Chat.get(chat));

    if (!iChat) return null;

    return Chat.Client(this, iChat);
  }

  public setChat(chat: Chat): Promise<void> {
    return this.bot.setChat(Chat.Client(this, chat));
  }

  public async getChats(): Promise<Chats> {
    const modules: Chats = {};

    const chats = await this.bot.getChats();

    for (const id in chats) {
      modules[id] = Chat.Client(this, chats[id]);
    }

    return modules;
  }

  public setChats(chats: Chats): Promise<void> {
    return this.bot.setChats(chats);
  }

  public addChat(chat: string | Chat): Promise<void> {
    return this.bot.addChat(Chat.Client(this, Chat.get(chat)));
  }

  public removeChat(chat: string | Chat): Promise<void> {
    return this.bot.removeChat(Chat.Client(this, Chat.get(chat)));
  }

  public getChatName(chat: Chat | string) {
    return this.bot.getChatName(Chat.get(chat));
  }

  public setChatName(chat: Chat | string, name: string) {
    return this.bot.setChatName(Chat.get(chat), name);
  }

  public getChatDescription(chat: Chat | string) {
    return this.bot.getChatDescription(Chat.get(chat));
  }

  public setChatDescription(chat: Chat | string, description: string) {
    return this.bot.setChatDescription(Chat.get(chat), description);
  }

  public getChatProfile(chat: Chat | string) {
    return this.bot.getChatProfile(Chat.get(chat));
  }

  public setChatProfile(chat: Chat | string, profile: Buffer) {
    return this.bot.setChatProfile(Chat.get(chat), profile);
  }

  public changeChatStatus(chat: Chat | string, status: ChatStatus): Promise<void> {
    return this.bot.changeChatStatus(Chat.get(chat), status);
  }

  public addUserInChat(chat: Chat | string, user: User | string) {
    return this.bot.addUserInChat(Chat.get(chat), User.get(user));
  }

  public removeUserInChat(chat: Chat | string, user: User | string) {
    return this.bot.removeUserInChat(Chat.get(chat), User.get(user));
  }

  public promoteUserInChat(chat: Chat | string, user: User | string) {
    return this.bot.promoteUserInChat(Chat.get(chat), User.get(user));
  }

  public demoteUserInChat(chat: Chat | string, user: User) {
    return this.bot.demoteUserInChat(Chat.get(chat), User.get(user));
  }

  public createChat(chat: Chat) {
    return this.bot.createChat(Chat.get(chat));
  }

  public leaveChat(chat: Chat | string) {
    return this.bot.leaveChat(Chat.get(chat));
  }

  public async getChatUsers(chat: Chat | string) {
    const users = await this.bot.getChatUsers(Chat.get(chat));

    const usersModules: Users = {};

    Object.keys(users).forEach((id) => {
      usersModules[id] = User.Client(this, users[id]);
    });

    return usersModules;
  }

  public async getChatAdmins(chat: Chat | string) {
    const admins = await this.bot.getChatAdmins(Chat.get(chat));

    const adminModules: Users = {};

    Object.keys(admins).forEach((id) => {
      adminModules[id] = User.Client(this, admins[id]);
    });

    return adminModules;
  }

  public async getChatLeader(chat: Chat | string): Promise<User> {
    const leader = await this.bot.getChatLeader(Chat.get(chat));

    return User.Client(this, leader);
  }

  //! <==============================> USER <==============================>

  public async getUser(user: User | string): Promise<User | null> {
    const usr = await this.bot.getUser(User.get(user));

    if (usr) return User.Client(this, usr);

    return null;
  }

  public setUser(user: User | string): Promise<void> {
    return this.bot.setUser(User.Client(this, User.get(user)));
  }

  public async getUsers(): Promise<Users> {
    const modules: Users = {};

    const users = await this.bot.getUsers();

    for (const id in users) {
      modules[id] = User.Client(this, users[id]);
    }

    return modules;
  }

  public setUsers(users: Users) {
    return this.bot.setUsers(users);
  }

  public addUser(user: User | string): Promise<void> {
    return this.bot.addUser(User.Client(this, User.get(user)));
  }

  public removeUser(user: User | string) {
    return this.bot.removeUser(User.get(user));
  }

  public getUserName(user: User | string) {
    if (User.getId(user) == this.id) return this.getBotName();

    return this.bot.getUserName(User.get(user));
  }

  public setUserName(user: User | string, name: string) {
    if (User.getId(user) == this.id) return this.setBotName(name);

    return this.bot.setUserName(User.get(user), name);
  }

  public getUserDescription(user: User | string) {
    if (User.getId(user) == this.id) return this.getBotDescription();

    return this.bot.getUserDescription(User.get(user));
  }

  public setUserDescription(user: User | string, description: string) {
    if (User.getId(user) == this.id) return this.setBotDescription(description);

    return this.bot.setUserDescription(User.get(user), description);
  }

  public getUserProfile(user: User | string) {
    if (User.getId(user) == this.id) return this.getBotProfile();

    return this.bot.getUserProfile(User.get(user));
  }

  public setUserProfile(user: User | string, profile: Buffer) {
    if (User.getId(user) == this.id) return this.setBotProfile(profile);

    return this.bot.setUserProfile(User.get(user), profile);
  }

  public unblockUser(user: User | string) {
    return this.bot.unblockUser(User.get(user));
  }

  public blockUser(user: User | string) {
    return this.bot.blockUser(User.get(user));
  }
}
