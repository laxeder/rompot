import { ChatStatus, IChat, IChatController, IMessage, IUser } from "rompot-base";

import ClientModule from "@modules/client/models/ClientModule";
import ChatUtils from "@modules/chat/utils/ChatUtils";
import UserUtils from "@modules/user/utils/UserUtils";

export default class ChatController extends ClientModule implements IChatController {
  #chat?: IChat;

  set chat(chat: IChat) {
    if (!chat) return;

    this.#chat = chat;
  }

  get chat(): IChat {
    if (!this.#chat) {
      this.#chat = ChatUtils.get("");
    }

    return this.#chat;
  }

  constructor(chat?: IChat) {
    super();

    this.chat = chat;
  }

  public async getName(): Promise<string> {
    return this.client.getChatName(this.chat);
  }

  public async setName(name: string): Promise<void> {
    await this.client.setChatName(this.chat, name);
  }

  public async getDescription(): Promise<string> {
    return this.client.getChatDescription(this.chat);
  }

  public async setDescription(description: string): Promise<void> {
    return this.client.setChatDescription(this.chat, description);
  }

  public async getProfile(): Promise<Buffer> {
    return this.client.getChatProfile(this.chat);
  }

  public async setProfile(image: Buffer): Promise<void> {
    return this.client.setChatProfile(this.chat, image);
  }

  public async isAdmin(user: IUser | string): Promise<boolean> {
    const admins = await this.client.getChatAdmins(this.chat);

    return admins.hasOwnProperty(UserUtils.getId(user));
  }

  public async isLeader(user: IUser | string): Promise<boolean> {
    const leader = await this.client.getChatLeader(this.chat);

    return leader.id == UserUtils.getId(user);
  }

  public async getAdmins(): Promise<Record<string, IUser>> {
    return this.client.getChatAdmins(this.chat);
  }

  public async getUsers(): Promise<Record<string, IUser>> {
    return await this.client.getChatUsers(this.chat);
  }

  public async addUser(user: IUser | string): Promise<void> {
    return this.client.addUserInChat(this.chat, user);
  }

  public async removeUser(user: IUser | string): Promise<void> {
    return this.client.removeUserInChat(this.chat, user);
  }

  public async promote(user: IUser | string): Promise<void> {
    return this.client.promoteUserInChat(this.chat, user);
  }

  public async demote(user: IUser | string): Promise<void> {
    return this.client.demoteUserInChat(this.chat, user);
  }

  public async leave(): Promise<void> {
    return this.client.leaveChat(this.chat);
  }

  public async send(message: IMessage | string): Promise<IMessage> {
    const msg = Message.get(message);

    if (!msg.chat.id) msg.chat.id = this.chat.id;
    if (!msg.user.id) msg.user.id = this.client.id;

    return this.client.send(msg);
  }

  public async changeStatus(status: ChatStatus): Promise<void> {
    return this.client.changeChatStatus(this.chat, status);
  }
}
