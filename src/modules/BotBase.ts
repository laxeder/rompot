import { ConnectionConfig, DefaultConnectionConfig } from "@config/ConnectionConfig";

import { MessageInterface } from "@interfaces/MessagesInterfaces";
import UserInterface from "@interfaces/UserInterface";
import ChatInterface from "@interfaces/ChatInterface";
import Auth from "@interfaces/Auth";

import LocationMessage from "@messages/LocationMessage";
import ContactMessage from "@messages/ContactMessage";
import ButtonMessage from "@messages/ButtonMessage";
import VideoMessage from "@messages/VideoMessage";
import ImageMessage from "@messages/ImageMessage";
import MediaMessage from "@messages/MediaMessage";
import ListMessage from "@messages/ListMessage";
import Message from "@messages/Message";

import Command from "@modules/Command";
import Chat from "@modules/Chat";
import User from "@modules/User";

import PromiseMessages from "@utils/PromiseMessages";
import Emmiter from "@utils/Emmiter";

import { Commands, CommandsInject } from "../types/Command";
import { BotModule, BotStatus } from "../types/Bot";
import { Chats, ChatStatus } from "../types/Chat";
import { Users } from "../types/User";

export default class BotBase implements BotModule {
  public async connect(auth: Auth | string) {}

  public async reconnect(alert?: boolean) {}

  public async stop(reason: any) {}

  //? ************** CONFIG **************

  public autoMessages: any = {};
  public promiseMessages: PromiseMessages = new PromiseMessages();

  public id: string = "";
  public status: BotStatus = "offline";
  public ev: Emmiter = new Emmiter();
  public config: ConnectionConfig = DefaultConnectionConfig;
  public commands: Commands = {};

  //? ****** ***** CONFIG ***** ******

  public configurate(config: ConnectionConfig = DefaultConnectionConfig) {
    this.config = this.config || config;

    this.configEvents();
  }

  public configEvents() {}

  //? ******* **** MESSAGE **** *******

  public async readMessage(message: MessageInterface) {}

  public async send(message: MessageInterface): Promise<Message> {
    return Message.Inject(this, message);
  }

  public async awaitMessage(chat: ChatInterface | string, ignoreMessageFromMe: boolean = true, stopRead: boolean = true, ...ignoreMessages: Message[]) {
    return this.promiseMessages.addPromiseMessage(Chat.getChatId(chat), ignoreMessageFromMe, stopRead, ...ignoreMessages);
  }

  public async addAutomate(message: Message, timeout: number, chats?: Chats, id: string = String(Date.now())): Promise<any> {}

  //? ****** **** COMMANDS **** ******

  setCommands(commands: CommandsInject) {}

  getCommands() {
    return {};
  }

  setCommand(command: Command) {}

  getCommand(command: string, ...args: any[]) {
    return null;
  }

  //? *************** CHAT **************

  public async addChat(chat: string | ChatInterface): Promise<void> {}

  public async removeChat(chat: string | ChatInterface): Promise<void> {}

  public async getChatName(chat: ChatInterface | string) {
    return "";
  }

  public async getChatDescription(chat: ChatInterface | string) {
    return "";
  }

  public async getChatProfile(chat: ChatInterface | string) {
    return Buffer.from("");
  }

  public async setChat(chat: ChatInterface): Promise<void> {}

  public async setChatName(chat: ChatInterface | string, name: string) {}

  public async setChatDescription(chat: ChatInterface | string, description: string) {}

  public async setChatProfile(chat: ChatInterface | string, profile: Buffer) {}

  public async addUserInChat(chat: ChatInterface | string, user: UserInterface | string) {}

  public async removeUserInChat(chat: ChatInterface | string, user: UserInterface | string) {}

  public async promoteUserInChat(chat: ChatInterface | string, user: UserInterface | string) {}

  public async demoteUserInChat(chat: ChatInterface | string, user: UserInterface) {}

  //TODO: Retornar chat module
  public async createChat(chat: ChatInterface): Promise<void> {}

  public async leaveChat(chat: ChatInterface | string) {}

  public async changeChatStatus(chat: string | ChatInterface, status: ChatStatus): Promise<void> {}

  public async getChat(chat: ChatInterface | string) {
    return null;
  }

  public async setChats(chats: Chats): Promise<void> {}

  public async getChatAdmins(chat: ChatInterface | string) {
    return {};
  }

  public async getChatLeader(chat: Chat | string): Promise<User> {
    return User.Inject(this, User.getUser(""));
  }

  public async getChats(): Promise<Chats> {
    return {};
  }

  //? *************** USER **************

  public async getBotName(): Promise<string> {
    return "";
  }

  public async setBotName(name: string): Promise<void> {}

  public async getBotDescription(): Promise<string> {
    return "";
  }

  public async setBotDescription(description: string): Promise<void> {}

  public async getBotProfile(): Promise<Buffer> {
    return Buffer.from("");
  }

  public async setBotProfile(image: Buffer): Promise<void> {}

  public async addUser(user: string | UserInterface): Promise<void> {}

  public async getUser(user: UserInterface | string) {
    return null;
  }

  public async setUser(user: string | UserInterface) {}

  public async removeUser(user: UserInterface | string) {}

  public async getUserName(user: UserInterface | string) {
    return "";
  }

  public async setUserName(user: UserInterface | string, name: string) {}

  public async getUserDescription(user: UserInterface | string) {
    return "";
  }

  public async setUserDescription(user: UserInterface | string, description: string) {}

  public async getUserProfile(user: UserInterface | string) {
    return Buffer.from("");
  }

  public async setUserProfile(user: UserInterface | string, profile: Buffer) {}

  public async unblockUser(user: UserInterface | string) {}

  public async blockUser(user: UserInterface | string) {}

  public async getUsers() {
    return {};
  }

  public async setUsers(users: Users) {}

  //? ************** MODELS **************

  Chat(chat: ChatInterface | string) {
    return new Chat(Chat.getChatId(chat));
  }

  User(user: UserInterface | string) {
    return new User(User.getUserId(user));
  }

  Command(): Command {
    return new Command();
  }

  //? ************** MESSAGE *************

  public async deleteMessage(message: MessageInterface): Promise<void> {}

  public async removeMessage(message: MessageInterface): Promise<void> {}

  public async addReaction(message: MessageInterface, reaction: string): Promise<void> {}

  public async removeReaction(message: MessageInterface): Promise<void> {}

  Message(chat: ChatInterface | string, text: string): Message {
    return new Message(Chat.getChat(chat), text);
  }

  MediaMessage(chat: ChatInterface | string, text: string, file: any): MediaMessage {
    return new MediaMessage(Chat.getChat(chat), text, file);
  }

  ImageMessage(chat: ChatInterface | string, text: string, image: Buffer): ImageMessage {
    return new ImageMessage(Chat.getChat(chat), text, image);
  }

  VideoMessage(chat: ChatInterface | string, text: string, video: Buffer): VideoMessage {
    return new VideoMessage(Chat.getChat(chat), text, video);
  }

  ContactMessage(chat: ChatInterface | string, text: string, contact: string | string[]): ContactMessage {
    return new ContactMessage(Chat.getChat(chat), text, contact);
  }

  LocationMessage(chat: ChatInterface | string, latitude: number, longitude: number): LocationMessage {
    return new LocationMessage(Chat.getChat(chat), latitude, longitude);
  }

  ListMessage(chat: ChatInterface | string, text: string, button: string): ListMessage {
    return new ListMessage(Chat.getChat(chat), text, button);
  }

  ButtonMessage(chat: ChatInterface | string, text: string): ButtonMessage {
    return new ButtonMessage(Chat.getChat(chat), text);
  }
}
