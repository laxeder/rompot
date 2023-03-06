import { IMessage, IMessageModule } from "@interfaces/Messages";
import { IUser } from "@interfaces/User";
import { IChat } from "@interfaces/Chat";

import { UserModule } from "@modules/User";
import { ChatModule } from "@modules/Chat";
import { ClientType } from "@modules/Client";
import BotBase from "@modules/BotBase";

import { getChat, getMessage, getUser } from "@utils/Generic";

export type MessageModule = IMessage & IMessageModule;

export function CreateMessage(
  chat: IChat | string,
  text: string,
  mention?: IMessage,
  id?: string,
  user?: IUser | string,
  fromMe?: boolean,
  selected?: string,
  mentions?: string[],
  timestamp?: Number | Long
): IMessage {
  return {
    chat: getChat(chat || ""),
    text: text || "",
    mention: mention || undefined,
    id: id || "",
    user: getUser(user || ""),
    fromMe: !!fromMe,
    selected: selected || "",
    mentions: mentions || [],
    timestamp: timestamp || Date.now(),
  };
}

export function Message(
  chat: IChat | string,
  text: string,
  mention?: IMessage,
  id?: string,
  user?: IUser | string,
  fromMe?: boolean,
  selected?: string,
  mentions?: string[],
  timestamp?: Number | Long
): MessageModule {
  return MessageModule(BotBase(), CreateMessage(chat, text, mention, id, user, fromMe, selected, mentions, timestamp));
}

export function MessageClient<CLIENT extends ClientType>(
  client: CLIENT,
  chat: IChat | string,
  text: string,
  mention?: IMessage,
  id?: string,
  user?: IUser | string,
  fromMe?: boolean,
  selected?: string,
  mentions?: string[],
  timestamp?: Number | Long
): MessageModule {
  return MessageModule(client, CreateMessage(chat, text, mention, id, user, fromMe, selected, mentions, timestamp));
}

export function MessageModule<CLIENT extends ClientType, MSG extends IMessage>(client: CLIENT, message: MSG): MSG & IMessageModule {
  const module: MSG & IMessageModule = {
    ...message,

    get client(): CLIENT {
      return client;
    },

    set client(c: CLIENT) {
      client = c;
    },

    chat: ChatModule(client, message.chat),
    user: UserModule(client, message.user),

    async addReaction(reaction: string): Promise<void> {
      return this.client.addReaction(this, reaction);
    },

    async reply(message: IMessage | string, mention: boolean = true) {
      const msg = getMessage(message);

      if (mention) msg.mention = this;

      return MessageModule(client, await client.send(msg));
    },

    async read(): Promise<void> {
      return this.client.readMessage(this);
    },
  };

  if (message.mention) module.mention = MessageModule(client, message.mention);

  return module;
}
