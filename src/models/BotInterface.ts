import { ConnectionConfig } from "@config/ConnectionConfig";
import WaitCallBack from "@utils/WaitCallBack";
import { StatusTypes } from "../types/Status";
import { Message } from "@messages/Message";
import { Emmiter } from "@utils/Emmiter";
import { Status } from "@models/Status";
import { Commands } from "./Commands";
import { Chat } from "@models/Chat";
import { User } from "@models/User";

export interface BotInterface {
  //? ************** CONFIG **************

  ev: Emmiter;
  wcb: WaitCallBack;
  commands: Commands;
  config: ConnectionConfig;
  status: StatusTypes;
  id: string;

  //? ************ CONNECTION ************

  connect(config: ConnectionConfig): Promise<void>;
  reconnect(config: ConnectionConfig): Promise<void>;
  stop(reason: any): Promise<void>;

  //? ************** MESSAGE *************

  sendMessage(message: Message): Promise<Message>;
  removeMessage(message: Message): Promise<void>;
  deleteMessage(message: Message): Promise<void>;

  //? ************** STATUS **************

  sendStatus(status: Status): Promise<Status>;

  //? *************** BOT ***************

  getBotName(): Promise<string>;
  setBotName(name: string): Promise<void>;

  getBotDescription(): Promise<string>;
  setBotDescription(description: string): Promise<string>;

  getBotProfile(): Promise<Buffer | null>;
  setBotProfile(image: Buffer): Promise<void>;

  //? *************** CHAT **************

  addChat(chat: Chat): Promise<void>;
  removeChat(chatId: string): Promise<void>;

  createChat(chat: Chat): Promise<void>;
  leaveChat(chatId: string): Promise<void>;

  getChat(chatId: string): Promise<Chat | null>;
  setChat(chat: Chat): Promise<void>;

  getChats(): Promise<{ [chatId: string]: Chat }>;
  setChats(chats: { [chatId: string]: Chat }): Promise<void>;

  //? *************** USER **************

  addUser(user: User): Promise<void>;
  removeUser(userId: string): Promise<void>;

  unblockUser(userId: string): Promise<void>;
  blockUser(userId: string): Promise<void>;

  getUser(userId: string): Promise<User | null>;
  setUser(user: User): Promise<void>;

  getUsers(): Promise<{ [userId: string]: User }>;
  setUsers(users: { [userId: string]: User }): Promise<void>;
}
