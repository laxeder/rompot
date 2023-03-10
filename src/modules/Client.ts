import { IMessage } from "@interfaces/Messages";
import ICommand from "@interfaces/ICommand";
import { IUser } from "@interfaces/User";
import { IChat } from "@interfaces/Chat";
import IBot from "@interfaces/IBot";
import Auth from "@interfaces/Auth";

import Message from "@messages/Message";

import User from "@modules/User";
import Chat from "@modules/Chat";

import { getChat, getChatId, getError, sleep, getUser, getUserId, MessageClient, ChatClient, UserClient } from "@utils/Generic";
import PromiseMessages from "@utils/PromiseMessages";
import { ClientEvents } from "@utils/Emmiter";

import { Chats, ChatStatus, IChats } from "../types/Chat";
import { IUsers, Users } from "../types/User";
import { ConnectionConfig, DefaultConnectionConfig } from "@config/ConnectionConfig";
import { IClient } from "@interfaces/Client";

export type ClientType = Client<IBot, ICommand>;

export default class Client<Bot extends IBot, Command extends ICommand> extends ClientEvents implements IClient {
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

  constructor(bot: Bot, config: ConnectionConfig = DefaultConnectionConfig, commands: Command[] = []) {
    super();

    this.bot = bot;
    this.config = config;
    this.commands = commands;

    this.configEvents();
  }

  public configEvents() {
    this.bot.ev.on("message", (message: IMessage) => {
      try {
        if (this.promiseMessages.resolvePromiseMessages(message)) return;

        this.emit("message", MessageClient(this, message));

        if (this.config.disableAutoCommand) return;

        this.getCommand(message.text)?.execute(MessageClient(this, message));
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
          action: update.action,
          chat: ChatClient(this, update.chat),
          user: UserClient(this, update.user),
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

  public connect(auth: Auth | string) {
    return this.bot.connect(auth);
  }

  public reconnect(alert?: boolean) {
    return this.bot.reconnect(alert);
  }

  public stop(reason: any) {
    return this.bot.stop(reason);
  }

  //! <============================> COMMANDS <============================>

  public setCommands(commands: Command[]) {
    this.commands = commands;
  }

  public getCommands() {
    return this.commands;
  }

  public addCommand(command: Command) {
    this.commands.push(command);
  }

  public getCommand(command: string): Command | null {
    const cmd = this.config.commandConfig?.get(command, this.commands);

    if (!cmd) return null;

    //@ts-ignore
    return cmd;
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

  public addReaction(message: IMessage, reaction: string): Promise<void> {
    return this.bot.addReaction(message, reaction);
  }

  public removeReaction(message: IMessage): Promise<void> {
    return this.bot.removeReaction(message);
  }

  public async send(message: IMessage): Promise<Message> {
    try {
      return MessageClient(this, await this.bot.send(message));
    } catch (err) {
      this.emit("error", getError(err));
    }

    return MessageClient(this, message);
  }

  public async awaitMessage(chat: IChat | string, ignoreMessageFromMe: boolean = true, stopRead: boolean = true, ...ignoreMessages: IMessage[]): Promise<Message> {
    return MessageClient(this, await this.promiseMessages.addPromiseMessage(getChatId(chat), ignoreMessageFromMe, stopRead, ...ignoreMessages));
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

  public async getChat(chat: IChat | string): Promise<Chat | null> {
    const iChat = await this.bot.getChat(getChat(chat));

    if (!iChat) return null;

    return ChatClient(this, iChat);
  }

  public setChat(chat: IChat): Promise<void> {
    return this.bot.setChat(ChatClient(this, chat));
  }

  public async getChats(): Promise<Chats> {
    const modules: Chats = {};

    const chats = await this.bot.getChats();

    for (const id in chats) {
      modules[id] = ChatClient(this, chats[id]);
    }

    return modules;
  }

  public setChats(chats: IChats): Promise<void> {
    return this.bot.setChats(chats);
  }

  public addChat(chat: string | IChat): Promise<void> {
    return this.bot.addChat(ChatClient(this, getChat(chat)));
  }

  public removeChat(chat: string | IChat): Promise<void> {
    return this.bot.removeChat(ChatClient(this, getChat(chat)));
  }

  public getChatName(chat: IChat | string) {
    return this.bot.getChatName(getChat(chat));
  }

  public setChatName(chat: IChat | string, name: string) {
    return this.bot.setChatName(getChat(chat), name);
  }

  public getChatDescription(chat: IChat | string) {
    return this.bot.getChatDescription(getChat(chat));
  }

  public setChatDescription(chat: IChat | string, description: string) {
    return this.bot.setChatDescription(getChat(chat), description);
  }

  public getChatProfile(chat: IChat | string) {
    return this.bot.getChatProfile(getChat(chat));
  }

  public setChatProfile(chat: IChat | string, profile: Buffer) {
    return this.bot.setChatProfile(getChat(chat), profile);
  }

  public changeChatStatus(chat: IChat | string, status: ChatStatus): Promise<void> {
    return this.bot.changeChatStatus(getChat(chat), status);
  }

  public addUserInChat(chat: IChat | string, user: IUser | string) {
    return this.bot.addUserInChat(getChat(chat), getUser(user));
  }

  public removeUserInChat(chat: IChat | string, user: IUser | string) {
    return this.bot.removeUserInChat(getChat(chat), getUser(user));
  }

  public promoteUserInChat(chat: IChat | string, user: IUser | string) {
    return this.bot.promoteUserInChat(getChat(chat), getUser(user));
  }

  public demoteUserInChat(chat: IChat | string, user: IUser) {
    return this.bot.demoteUserInChat(getChat(chat), getUser(user));
  }

  public createChat(chat: IChat) {
    return this.bot.createChat(getChat(chat));
  }

  public leaveChat(chat: IChat | string) {
    return this.bot.leaveChat(getChat(chat));
  }

  public async getChatAdmins(chat: IChat | string) {
    const admins = await this.bot.getChatAdmins(getChat(chat));

    const adminModules: Users = {};

    Object.keys(admins).forEach((id) => {
      adminModules[id] = UserClient(this, admins[id]);
    });

    return adminModules;
  }

  public async getChatLeader(chat: IChat | string): Promise<User> {
    const leader = await this.bot.getChatLeader(getChat(chat));

    return UserClient(this, leader);
  }

  //! <==============================> USER <==============================>

  public async getUser(user: IUser | string): Promise<User | null> {
    const usr = await this.bot.getUser(getUser(user));

    if (usr) return UserClient(this, usr);

    return null;
  }

  public setUser(user: IUser | string): Promise<void> {
    return this.bot.setUser(UserClient(this, getUser(user)));
  }

  public async getUsers(): Promise<Users> {
    const modules: Users = {};

    const users = await this.bot.getUsers();

    for (const id in users) {
      modules[id] = UserClient(this, users[id]);
    }

    return modules;
  }

  public setUsers(users: IUsers) {
    return this.bot.setUsers(users);
  }

  public addUser(user: IUser | string): Promise<void> {
    return this.bot.addUser(UserClient(this, getUser(user)));
  }

  public removeUser(user: IUser | string) {
    return this.bot.removeUser(getUser(user));
  }

  public getUserName(user: IUser | string) {
    if (getUserId(user) == this.id) return this.getBotName();

    return this.bot.getUserName(getUser(user));
  }

  public setUserName(user: IUser | string, name: string) {
    if (getUserId(user) == this.id) return this.setBotName(name);

    return this.bot.setUserName(getUser(user), name);
  }

  public getUserDescription(user: IUser | string) {
    if (getUserId(user) == this.id) return this.getBotDescription();

    return this.bot.getUserDescription(getUser(user));
  }

  public setUserDescription(user: IUser | string, description: string) {
    if (getUserId(user) == this.id) return this.setBotDescription(description);

    return this.bot.setUserDescription(getUser(user), description);
  }

  public getUserProfile(user: IUser | string) {
    if (getUserId(user) == this.id) return this.getBotProfile();

    return this.bot.getUserProfile(getUser(user));
  }

  public setUserProfile(user: IUser | string, profile: Buffer) {
    if (getUserId(user) == this.id) return this.setBotProfile(profile);

    return this.bot.setUserProfile(getUser(user), profile);
  }

  public unblockUser(user: IUser | string) {
    return this.bot.unblockUser(getUser(user));
  }

  public blockUser(user: IUser | string) {
    return this.bot.blockUser(getUser(user));
  }
}
