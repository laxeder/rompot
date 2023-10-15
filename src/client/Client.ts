import { readFileSync } from "fs";

import { DEFAULT_CONNECTION_CONFIG } from "../configs/Defaults";
import ConnectionConfig from "../configs/ConnectionConfig";

import MessageHandler, { MessageHandlerConfig } from "../utils/MessageHandler";
import CommandController from "../command/CommandController";
import ReactionMessage from "../messages/ReactionMessage";
import { CMDRunType } from "../command/CommandEnums";
import MediaMessage from "../messages/MediaMessage";
import { sleep, getError } from "../utils/Generic";
import { ChatStatus } from "../chat/ChatStatus";
import { BotStatus } from "../bot/BotStatus";
import ClientEvents from "./ClientEvents";
import Message from "../messages/Message";
import Command from "../command/Command";
import BotBase from "../bot/BotBase";
import Chat from "../chat/Chat";
import User from "../user/User";
import IBot from "../bot/IBot";
import IAuth from "./IAuth";

export default class Client<Bot extends IBot> extends ClientEvents {
  public messageHandler: MessageHandler = new MessageHandler();

  public commandController: CommandController = new CommandController();
  public config: ConnectionConfig;
  public bot: Bot;

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

  //! =================================================================
  //! ========== CONFIGURAÇÃO DOS EVENTOS
  //! =================================================================

  public configEvents() {
    this.bot.on("message", async (message: Message) => {
      try {
        message.setBotId(this.id);

        if (!message.fromMe && !this.config.disableAutoRead) await this.readMessage(message);
        if (this.messageHandler.resolveMessage(message)) return;

        this.emit("message", message);

        if (this.config.disableAutoCommand) return;
        if (this.config.disableAutoCommandForUnofficialMessage && message.isUnofficial) return;

        const command = this.searchCommand(message.text);

        if (command != null) {
          this.runCommand(command, message, CMDRunType.Exec);
        }
      } catch (err) {
        this.emit("error", getError(err));
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

    this.bot.on("user", (update) => {
      try {
        this.emit("user", {
          event: update.event,
          action: update.action,
          chat: Chat.get(update.chat, this.id),
          user: User.get(update.user, this.id),
          fromUser: User.get(update.fromUser, this.id),
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

  //! =================================================================
  //! ========== CONEXÃO
  //! =================================================================

  public async connect(auth: IAuth | string) {
    await this.bot.connect(auth);

    Client.setClient(this);
  }

  public async connectByCode(phoneNumber: number | string, auth: string | IAuth): Promise<string> {
    const id = String(phoneNumber).replace(/\D+/g, "");

    this.id = id;

    const code = await this.bot.connectByCode(id, auth);

    Client.setClient(this);

    return code;
  }

  public async reconnect(alert?: boolean) {
    await this.bot.reconnect(alert);

    Client.setClient(this);
  }

  public stop(reason?: any) {
    return this.bot.stop(reason);
  }

  //! =================================================================
  //! ========== COMANDO
  //! =================================================================

  public getCommandController(): CommandController {
    if (this.commandController.botId != this.id) {
      this.commandController.botId = this.id;
    }

    return this.commandController;
  }

  public setCommandController(controller: CommandController): void {
    controller.botId = this.id;

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

    command.botId = this.id;

    return command;
  }

  public runCommand(command: Command, message: Message, type?: string) {
    return this.commandController.runCommand(command, message, type);
  }

  //! <============================> MESSAGES <============================>

  public deleteMessage(message: Message): Promise<void> {
    return this.bot.removeMessage(message);
  }

  public removeMessage(message: Message): Promise<void> {
    return this.bot.removeMessage(message);
  }

  public readMessage(message: Message) {
    return this.bot.readMessage(message);
  }

  public editMessage(message: Message, text: string): Promise<void> {
    message.text = text;
    message.isEdited = true;

    return this.bot.editMessage(message);
  }

  public addReaction(message: Message, reaction: string): Promise<void> {
    return this.bot.addReaction(new ReactionMessage(message.chat, reaction, message));
  }

  public removeReaction(message: Message): Promise<void> {
    return this.bot.removeReaction(new ReactionMessage(message.chat, "", message));
  }

  public addAnimatedReaction(message: Message, reactions: string[], interval: number = 2000, maxTimeout: number = 60000): (reactionStop?: string) => Promise<void> {
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

  public async send(message: Message): Promise<Message> {
    try {
      if (!this.config.disableAutoTyping) {
        await this.changeChatStatus(message.chat, ChatStatus.Typing);
      }

      return Message.get(await this.bot.send(message), this.id);
    } catch (err) {
      this.emit("error", getError(err));
    }

    return Message.get(message, this.id);
  }

  public async sendMessage(chat: Chat | string, message: string | Message, mention?: Message): Promise<Message> {
    if (Message.isValid(message)) {
      message = Message.get(message, this.id);
      message.chat = Chat.get(chat, this.id);
      message.mention = mention;

      return await this.send(message);
    }

    return await this.send(new Message(chat, message, { mention }));
  }

  public async awaitMessage(chat: Chat | string, config: Partial<MessageHandlerConfig> = {}): Promise<Message> {
    return Message.get(await this.messageHandler.addMessage(Chat.getId(chat), config), this.id);
  }

  /**
   * * Retorna a stream da mídia
   * @param message Mídia que será baixada
   * @returns Stream da mídia
   */
  async downloadStreamMessage(message: MediaMessage): Promise<Buffer> {
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

  public async getChat(chat: Chat | string): Promise<Chat | null> {
    const chatData = await this.bot.getChat(Chat.get(chat));

    if (chatData == null) return null;

    return Chat.get(chatData, this.id);
  }

  public setChat(chat: Chat): Promise<void> {
    return this.bot.setChat(chat);
  }

  public async getChats(): Promise<Chat[]> {
    const ids: string[] = await this.bot.getChats();
    const chats: Chat[] = [];

    await Promise.all(
      ids.map(async (id) => {
        const chat = await this.bot.getChat(new Chat(id));

        if (chat == null) return;

        chats.push(chat);
      })
    );

    return chats;
  }

  public setChats(chats: Chat[]): Promise<void> {
    return this.bot.setChats(chats);
  }

  public addChat(chat: string | Chat): Promise<void> {
    return this.bot.addChat(Chat.get(chat, this.id));
  }

  public removeChat(chat: string | Chat): Promise<void> {
    return this.bot.removeChat(Chat.get(chat, this.id));
  }

  public getChatName(chat: Chat | string) {
    return this.bot.getChatName(Chat.get(chat, this.id));
  }

  public setChatName(chat: Chat | string, name: string) {
    return this.bot.setChatName(Chat.get(chat, this.id), name);
  }

  public getChatDescription(chat: Chat | string) {
    return this.bot.getChatDescription(Chat.get(chat, this.id));
  }

  public setChatDescription(chat: Chat | string, description: string) {
    return this.bot.setChatDescription(Chat.get(chat, this.id), description);
  }

  public getChatProfile(chat: Chat | string) {
    return this.bot.getChatProfile(Chat.get(chat, this.id));
  }

  public setChatProfile(chat: Chat | string, profile: Buffer) {
    return this.bot.setChatProfile(Chat.get(chat, this.id), profile);
  }

  public changeChatStatus(chat: Chat | string, status: ChatStatus): Promise<void> {
    return this.bot.changeChatStatus(Chat.get(chat, this.id), status);
  }

  public addUserInChat(chat: Chat | string, user: User | string) {
    return this.bot.addUserInChat(Chat.get(chat, this.id), User.get(user, this.id));
  }

  public removeUserInChat(chat: Chat | string, user: User | string) {
    return this.bot.removeUserInChat(Chat.get(chat, this.id), User.get(user, this.id));
  }

  public promoteUserInChat(chat: Chat | string, user: User | string) {
    return this.bot.promoteUserInChat(Chat.get(chat, this.id), User.get(user, this.id));
  }

  public demoteUserInChat(chat: Chat | string, user: User | string) {
    return this.bot.demoteUserInChat(Chat.get(chat, this.id), User.get(user, this.id));
  }

  public createChat(chat: Chat) {
    return this.bot.createChat(Chat.get(chat, this.id));
  }

  public leaveChat(chat: Chat | string) {
    return this.bot.leaveChat(Chat.get(chat, this.id));
  }

  public async getChatUsers(chat: Chat | string): Promise<string[]> {
    return await this.bot.getChatUsers(Chat.get(chat, this.id));
  }

  public async getChatAdmins(chat: Chat | string): Promise<string[]> {
    return await this.bot.getChatAdmins(Chat.get(chat, this.id));
  }

  public async getChatLeader(chat: Chat | string): Promise<User> {
    return User.get(await this.bot.getChatLeader(Chat.get(chat, this.id)), this.id);
  }

  //! <==============================> USER <==============================>

  public async getUser(user: User | string): Promise<User | null> {
    const userData = await this.bot.getUser(User.get(user, this.id));

    if (userData == null) return null;

    return User.get(userData, this.id);
  }

  public setUser(user: User | string): Promise<void> {
    return this.bot.setUser(User.get(user, this.id));
  }

  public async getUsers(): Promise<User[]> {
    const ids: string[] = await this.bot.getUsers();
    const users: User[] = [];

    await Promise.all(
      ids.map(async (id) => {
        const user = await this.bot.getUser(new User(id));

        if (user == null) return;

        users.push(user);
      })
    );

    return users;
  }

  public setUsers(users: User[]) {
    return this.bot.setUsers(users);
  }

  public addUser(user: User | string): Promise<void> {
    return this.bot.addUser(User.get(user, this.id));
  }

  public removeUser(user: User | string) {
    return this.bot.removeUser(User.get(user, this.id));
  }

  public getUserName(user: User | string) {
    if (User.getId(user) == this.id) return this.getBotName();

    return this.bot.getUserName(User.get(user, this.id));
  }

  public setUserName(user: User | string, name: string) {
    if (User.getId(user) == this.id) return this.setBotName(name);

    return this.bot.setUserName(User.get(user, this.id), name);
  }

  public getUserDescription(user: User | string) {
    if (User.getId(user) == this.id) return this.getBotDescription();

    return this.bot.getUserDescription(User.get(user, this.id));
  }

  public setUserDescription(user: User | string, description: string) {
    if (User.getId(user) == this.id) return this.setBotDescription(description);

    return this.bot.setUserDescription(User.get(user, this.id), description);
  }

  public getUserProfile(user: User | string) {
    if (User.getId(user) == this.id) return this.getBotProfile();

    return this.bot.getUserProfile(User.get(user, this.id));
  }

  public setUserProfile(user: User | string, profile: Buffer) {
    if (User.getId(user) == this.id) return this.setBotProfile(profile);

    return this.bot.setUserProfile(User.get(user, this.id), profile);
  }

  public unblockUser(user: User | string) {
    return this.bot.unblockUser(User.get(user, this.id));
  }

  public blockUser(user: User | string) {
    return this.bot.blockUser(User.get(user, this.id));
  }

  public static getClients(): Record<string, Client<IBot>> {
    if (!global.hasOwnProperty("rompot-clients") || typeof global["rompot-clients"] != "object") {
      global["rompot-clients"] = {};
    }

    return global["rompot-clients"];
  }

  public static setClients(clients: Record<string, Client<IBot>>): void {
    global["rompot-clients"] = clients;
  }

  public static getClient(id: string): Client<IBot> {
    const clients = Client.getClients();

    if (clients.hasOwnProperty(id) && typeof clients[id] == "object") {
      return clients[id];
    }

    return new Client(new BotBase());
  }

  public static setClient(client: Client<IBot>): void {
    const clients = Client.getClients();

    clients[client.id] = client;

    Client.setClients(clients);
  }
}
