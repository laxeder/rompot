import { ConnectionConfig } from "@config/ConnectionConfig";
import { LocationMessage } from "@messages/LocationMessage";
import { ReactionMessage } from "@messages/ReactionMessage";
import { ContactMessage } from "@messages/ContactMessage";
import { ButtonMessage } from "@messages/ButtonMessage";
import { ImageMessage } from "@messages/ImageMessage";
import { MediaMessage } from "@messages/MediaMessage";
import { VideoMessage } from "@messages/VideoMessage";
import PromiseMessages from "@utils/PromiseMessages";
import { ListMessage } from "@messages/ListMessage";
import WaitCallBack from "@utils/WaitCallBack";
import { BotModule } from "../types/BotModule";
import { StatusTypes } from "../types/Status";
import Message from "@messages/Message";
import { Emmiter } from "@utils/Emmiter";
import { Commands } from "./Commands";
import { Command } from "./Command";
import { Status } from "./Status";
import { Chat } from "./Chat";
import UserInterface from "@interfaces/UserInterface";
import UserModule from "./User";

export default class BotBase implements BotModule {
  //? ************** CONFIG **************

  public autoMessages: any = {};
  public promiseMessages: PromiseMessages = new PromiseMessages();
  public ev: Emmiter = new Emmiter();
  public wcb: WaitCallBack = new WaitCallBack();
  public commands: Commands = new Commands(this);
  public config: ConnectionConfig = { auth: "./session" };
  public status: StatusTypes = "offline";
  public id: string = "";

  public Chat(id: string) {
    return new Chat(id);
  }
  public User(id: string) {
    return new UserModule(id);
  }
  public Status = Status;
  public Command = Command;
  public Commands = Commands;
  public Message = Message;
  public ButtonMessage = ButtonMessage;
  public ContactMessage = ContactMessage;
  public ImageMessage = ImageMessage;
  public ListMessage = ListMessage;
  public LocationMessage = LocationMessage;
  public MediaMessage = MediaMessage;
  public ReactionMessage = ReactionMessage;
  public VideoMessage = VideoMessage;

  public configurate() {}
  public configEvents() {}

  public static Build() {
    return new BotBase();
  }

  //? ************ CONNECTION ************

  public async connect(config: ConnectionConfig): Promise<void> {}
  public async reconnect(config: ConnectionConfig): Promise<void> {}
  public async stop(reason: any): Promise<void> {}

  //? ************** MESSAGE *************

  public async sendMessage(message: Message): Promise<Message> {
    return message;
  }
  public async removeMessage(message: Message): Promise<void> {}
  public async deleteMessage(message: Message): Promise<void> {}

  //? ************** STATUS **************

  public async sendStatus(status: Status): Promise<Status> {
    return status;
  }

  //? *************** BOT ***************

  public async getBotName(): Promise<string> {
    return "";
  }
  public async setBotName(name: string): Promise<void> {}

  public async getBotDescription(): Promise<string> {
    return "";
  }
  public async setBotDescription(description: string): Promise<string> {
    return "";
  }

  public async getBotProfile(): Promise<Buffer | null> {
    return Buffer.from("", "base64");
  }
  public async setBotProfile(image: Buffer): Promise<void> {}

  //? *************** CHAT **************

  public async addChat(chat: Chat): Promise<void> {}
  public async removeChat(chatId: string): Promise<void> {}

  public async createChat(chat: Chat): Promise<void> {}
  public async leaveChat(chatId: string): Promise<void> {}

  public async getChat(chatId: string): Promise<Chat | null> {
    return null;
  }
  public async setChat(chat: Chat): Promise<void> {}

  public async getChats(): Promise<{ [chatId: string]: Chat }> {
    return {};
  }
  public async setChats(chats: { [chatId: string]: Chat }): Promise<void> {}

  //? *************** USER **************

  public async addUser(user: User): Promise<void> {}
  public async removeUser(userId: string): Promise<void> {}

  public async unblockUser(userId: string): Promise<void> {}
  public async blockUser(userId: string): Promise<void> {}

  public async getUser(userId: string): Promise<User | null> {
    return null;
  }
  public async setUser(user: User): Promise<void> {}

  public async getUsers(): Promise<{ [userId: string]: User }> {
    return {};
  }
  public async setUsers(users: { [userId: string]: User }): Promise<void> {}

  //? ******* **** MESSAGE **** *******

  public async send<Content extends Message | Status>(content: Content): Promise<Content> {
    return content;
  }

  public async awaitMessage(chat: Chat | string, ignoreMessageFromMe: boolean = true, stopRead: boolean = true, ...ignoreMessages: Message[]): Promise<Message> {
    return new Message(new Chat(""), "");
  }

  async addAutomate(message: Message, timeout: number, chats?: { [key: string]: Chat }, id: string = String(Date.now())): Promise<any> {}

  //? ****** **** COMMANDS **** ******

  public setCommands(commands: Commands) {}

  public getCommands(): Commands {
    return this.commands;
  }

  public setCommand(command: Command) {}

  public getCommand(command: Command | string | string[]) {
    return undefined;
  }

  //? ******* ***** USER ***** *******

  public async getUserName(user: User | string): Promise<string> {
    return "";
  }

  public async getUserDescription(user: User | string): Promise<string> {
    return "";
  }

  public async getUserProfile(user: User | string): Promise<Buffer> {
    return Buffer.from("");
  }

  //? ******* ***** CHAT ***** *******

  public async getChatName(chat: Chat | string): Promise<string> {
    return "";
  }

  public async getChatDescription(chat: Chat | string): Promise<string> {
    return "";
  }

  public async getChatProfile(chat: Chat | string): Promise<Buffer> {
    return Buffer.from("");
  }

  public async getChatAdmins(chatId: string): Promise<User[]> {
    return [];
  }

  public async getChatLeader(chatId: string): Promise<User> {
    return new User(this, "");
  }
}
