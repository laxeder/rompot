import { MessageType } from "@enums/Message";

import { IMessage } from "@interfaces/IMessage";
import { IClient } from "@interfaces/IClient";

import { ClientBase } from "@modules/Base";

import User from "@modules/User";
import Chat from "@modules/Chat";

import { injectJSON } from "@utils/Generic";
import { IChat } from "@interfaces/IChat";
import { IUser } from "@interfaces/IUser";

export default class Message implements IMessage {
  #client: IClient = ClientBase();

  public readonly type: MessageType = MessageType.Text;

  public chat: IChat = new Chat("");
  public user: IUser = new User("");
  public mention?: IMessage = undefined;

  public id: string = "";
  public text: string = "";
  public selected: string = "";

  public fromMe: boolean = false;
  public apiSend: boolean = false;
  public isDeleted: boolean = false;

  public mentions: string[] = [];
  public timestamp: Number | Long = Date.now();

  get client(): IClient {
    return this.#client;
  }

  set client(client: IClient) {
    this.#client = client;

    this.chat.client = client;
    this.user.client = client;

    if (this.mention) this.mention.client = client;
  }

  constructor(chat: IChat | string, text: string, others: Partial<Message> = {}) {
    this.text = text || "";

    injectJSON(others, this);

    this.chat = Chat.Client(this.client, chat || "");
    this.user = User.Client(this.client, this.user || "");

    if (this.mention) this.mention = Message.Client(this.client, this.mention);
  }

  public async addReaction(reaction: string): Promise<void> {
    return this.client.addReaction(this, reaction);
  }

  public async removeReaction(): Promise<void> {
    return this.client.removeReaction(this);
  }

  public addAnimatedReaction(reactions: string[], interval?: number, maxTimeout?: number): (reactionStop?: string) => Promise<void> {
    return this.client.addAnimatedReaction(this, reactions, interval, maxTimeout);
  }

  public async reply(message: Message | string, mention: boolean = true) {
    const msg = Message.get(message);

    if (!!!msg.chat.id) msg.chat.id = this.chat.id;
    if (!!!msg.user.id) msg.user.id = this.client.id;

    if (mention) msg.mention = this;

    return this.client.send(msg);
  }

  public async read(): Promise<void> {
    return this.client.readMessage(this);
  }

  /**
   * @param message Mensagem que será obtida
   * @returns Retorna a mensagem
   */
  public static get<MSG extends IMessage>(message: MSG | string): MSG | IMessage {
    if (typeof message == "string") {
      return new Message(new Chat(""), message);
    }

    return message;
  }

  /**
   * @param message Mensagem
   * @returns Retorna o ID da mensagem
   */
  public static getId(message: IMessage | string): string {
    if (typeof message == "string") {
      return String(message || "");
    }

    if (typeof message == "object" && !Array.isArray(message) && message?.id) {
      return String(message.id);
    }

    return String(message || "");
  }

  /**
   * * Cria uma mensagem com cliente instanciado
   * @param client Cliente
   * @param msg Mensagem
   * @returns
   */
  public static Client<MSG extends IMessage>(client: IClient, message: MSG): MSG {
    message.client = client;

    return message;
  }
}
