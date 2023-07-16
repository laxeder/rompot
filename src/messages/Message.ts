import { IChat, IMessage, IUser, MessageType } from "rompot-base";

import { Chat, ChatUtils } from "@modules/chat";
import { User, UserUtils } from "@modules/user";
import { ClientModule } from "@modules/client";

import MessageUtils from "@utils/MessageUtils";
import { injectJSON } from "@utils/Generic";

export default class Message extends ClientModule implements IMessage {
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
  public isEdited: boolean = false;

  public mentions: string[] = [];
  public timestamp: Number = Date.now();

  constructor(chat: IChat | string, text: string, others: Partial<Message> = {}) {
    super();

    this.text = text || "";

    injectJSON(others, this);

    this.chat = ChatUtils.applyClient(this.client, chat || "");
    this.user = UserUtils.applyClient(this.client, this.user || "");

    if (this.mention) this.mention = MessageUtils.applyClient(this.client, this.mention);
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
    const msg = MessageUtils.get(message);

    if (!!!msg.chat.id) msg.chat.id = this.chat.id;
    if (!!!msg.user.id) msg.user.id = this.client.id;

    if (mention) msg.mention = this;

    return this.client.send(msg);
  }

  public async read(): Promise<void> {
    return this.client.readMessage(this);
  }
}
