import { IMessage, IMessageModule } from "@interfaces/Messages";
import { IUser } from "@interfaces/User";
import { IChat } from "@interfaces/Chat";

import { ClientType } from "@modules/Client";
import BaseBot from "@modules/BotBase";

import { getChat, getMessage, getUser } from "@utils/Generic";

export default class Message implements IMessage, IMessageModule {
  public chat: IChat;
  public text: string;
  public mention?: IMessage | undefined;
  public id: string;
  public user: IUser;
  public fromMe: boolean;
  public selected: string;
  public mentions: string[];
  public timestamp: Number | Long;

  #client: ClientType = BaseBot();

  get client() {
    return this.#client;
  }

  set client(client: ClientType) {
    this.#client = client;
  }

  constructor(chat: IChat | string, text: string, mention?: IMessage, id?: string, user?: IUser | string, fromMe?: boolean, selected?: string, mentions?: string[], timestamp?: Number | Long) {
    this.chat = getChat(chat || "");
    this.user = getUser(user || "");

    this.id = id || "";
    this.text = text || "";
    this.fromMe = !!fromMe;
    this.selected = selected || "";
    this.mentions = mentions || [];
    this.timestamp = timestamp || Date.now();

    if (mention) this.mention = new Message(mention.chat, mention.text, mention.mention, mention.id, mention.user, mention.fromMe, mention.selected, mention.mentions, mention.timestamp);
  }

  public async addReaction(reaction: string): Promise<void> {
    return this.client.addReaction(this, reaction);
  }

  public async reply(message: IMessage | string, mention: boolean = true) {
    const msg = getMessage(message);

    if (mention) msg.mention = this;

    return this.client.send(msg);
  }

  public async read(): Promise<void> {
    return this.client.readMessage(this);
  }
}
