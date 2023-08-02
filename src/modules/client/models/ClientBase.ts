import { BotStatus, ChatStatus, ConnectionConfig, IAuth, IChat, IClient, ICommand, ICommandController, IMediaMessage, IMessage, IPromiseMessage, IUser, PromiseMessageConfig } from "rompot-base";

import BotBase from "@modules/bot/models/BotBase";

import Message from "@messages/Message";

import ClientEvents from "@modules/client/events/ClientEvents";

import PromiseMessages from "@utils/PromiseMessages";

export default class ClientBase extends ClientEvents implements IClient {
  public promiseMessages: IPromiseMessage = new PromiseMessages();
  public autoMessages: any = {};

  public bot: BotBase = new BotBase();
  public config: ConnectionConfig;
  //@ts-ignore
  public commandController: ICommandController = {};

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

  constructor() {
    super();
  }

  public configEvents() {}

  public async connect(auth: IAuth | string) {}

  public async connectByCode(phoneNumber: number | string, auth: string | IAuth): Promise<string> {
    return "";
  }

  public async reconnect(alert?: boolean) {}

  public async stop(reason?: any) {}

  public getCommandController(): ICommandController {
    return this.commandController;
  }

  public setCommandController(controller: ICommandController): void {}

  public setCommands(commands: ICommand[]) {}

  public getCommands() {
    return this.commandController.getCommands();
  }

  public addCommand(command: ICommand): void {}

  public removeCommand(command: ICommand): boolean {
    return false;
  }

  public searchCommand(text: string): ICommand | null {
    return null;
  }

  public runCommand(command: ICommand, message: IMessage, type?: string) {}

  //! <============================> MESSAGES <============================>

  public async deleteMessage(message: IMessage): Promise<void> {}

  public async removeMessage(message: IMessage): Promise<void> {}

  public async readMessage(message: IMessage) {}

  public async editMessage(message: IMessage, text: string): Promise<void> {}

  public async addReaction(message: IMessage, reaction: string): Promise<void> {}

  public async removeReaction(message: IMessage): Promise<void> {}

  public addAnimatedReaction(message: IMessage, reactions: string[], interval: number = 2000, maxTimeout: number = 60000): (reactionStop?: string) => Promise<void> {
    return async (reactionStop?: string) => {};
  }

  public async send(message: IMessage): Promise<IMessage> {
    return message;
  }

  public async sendMessage(chat: IChat | string, message: string | IMessage, mention?: IMessage): Promise<IMessage> {
    return new Message(chat, "");
  }

  public async awaitMessage(chat: IChat | string, config: Partial<PromiseMessageConfig> = {}): Promise<IMessage> {
    return new Promise<IMessage>(() => {});
  }

  public async downloadStreamMessage(message: IMediaMessage): Promise<Buffer> {
    return Buffer.from("");
  }

  //! <===============================> BOT <==============================>

  public async getBotName() {
    return "";
  }

  public async setBotName(name: string) {}

  public async getBotDescription() {
    return "";
  }

  public async setBotDescription(description: string) {}

  public async getBotProfile() {
    return Buffer.from("");
  }

  public async setBotProfile(profile: Buffer) {}

  //! <==============================> CHAT <==============================>

  public async getChat(chat: IChat | string): Promise<IChat | null> {
    return null;
  }

  public async setChat(chat: IChat): Promise<void> {}

  public async getChats(): Promise<Record<string, IChat>> {
    return {};
  }

  public async setChats(chats: Record<string, IChat>): Promise<void> {}

  public async addChat(chat: string | IChat): Promise<void> {}

  public async removeChat(chat: string | IChat): Promise<void> {}

  public async getChatName(chat: IChat | string) {
    return "";
  }

  public async setChatName(chat: IChat | string, name: string) {}

  public async getChatDescription(chat: IChat | string) {
    return "";
  }

  public async setChatDescription(chat: IChat | string, description: string) {}

  public async getChatProfile(chat: IChat | string) {
    return Buffer.from("");
  }

  public async setChatProfile(chat: IChat | string, profile: Buffer) {}

  public async changeChatStatus(chat: IChat | string, status: ChatStatus): Promise<void> {}

  public async addUserInChat(chat: IChat | string, user: IUser | string) {}

  public async removeUserInChat(chat: IChat | string, user: IUser | string) {}

  public async promoteUserInChat(chat: IChat | string, user: IUser | string) {}

  public async demoteUserInChat(chat: IChat | string, user: IUser) {}

  public async createChat(chat: IChat) {}

  public async leaveChat(chat: IChat | string) {}

  public async getChatUsers(chat: IChat | string) {
    return {};
  }

  public async getChatAdmins(chat: IChat | string) {
    return {};
  }

  public async getChatLeader(chat: IChat | string): Promise<IUser> {
    return new Promise<IUser>(() => {});
  }

  //! <==============================> USER <==============================>

  public async getUser(user: IUser | string): Promise<IUser | null> {
    return null;
  }

  public async setUser(user: IUser | string): Promise<void> {}

  public async getUsers(): Promise<Record<string, IUser>> {
    return {};
  }

  public async setUsers(users: Record<string, IUser>) {}

  public async addUser(user: IUser | string): Promise<void> {}

  public async removeUser(user: IUser | string) {}

  public async getUserName(user: IUser | string) {
    return "";
  }

  public async setUserName(user: IUser | string, name: string) {}

  public async getUserDescription(user: IUser | string) {
    return "";
  }

  public async setUserDescription(user: IUser | string, description: string) {}

  public async getUserProfile(user: IUser | string) {
    return Buffer.from("");
  }

  public async setUserProfile(user: IUser | string, profile: Buffer) {}

  public async unblockUser(user: IUser | string) {}

  public async blockUser(user: IUser | string) {}
}
