import { IListMessage, IMessage, IMessageModule } from "@interfaces/Messages";
import { IUser } from "@interfaces/User";
import { IChat } from "@interfaces/Chat";

import { CreateMessage, MessageModule } from "@messages/Message";

import { ClientType } from "@modules/Client";
import BotBase from "@modules/BotBase";

import { ListItem } from "../types/Message";

export type ListMessageModule = IListMessage & IMessageModule;

export type ListMessage = ListMessageModule;

export function CreateListMessage(
  chat: IChat | string,
  text: string,
  button: string,
  footer?: string,
  title?: string,
  mention?: IMessage,
  id?: string,
  user?: IUser | string,
  fromMe?: boolean,
  selected?: string,
  mentions?: string[],
  timestamp?: Number | Long
): IListMessage {
  const msg: IListMessage = {
    ...CreateMessage(chat, text, mention, id, user, fromMe, selected, mentions, timestamp),
    footer: footer || "",
    title: title || "",
    button: button || "",
    list: [],

    addCategory(title: string, items: Array<ListItem> = []): number {
      const index = this.list.length;

      this.list.push({ title, items });

      return index;
    },

    addItem(index: number, title: string, description: string = "", id: string = String(Date.now())) {
      return this.list[index].items.push({ title, description, id });
    },
  };

  return msg;
}

export function ListMessage(
  chat: IChat | string,
  text: string,
  button: string,
  footer?: string,
  title?: string,
  mention?: IMessage,
  id?: string,
  user?: IUser | string,
  fromMe?: boolean,
  selected?: string,
  mentions?: string[],
  timestamp?: Number | Long
): ListMessageModule {
  return ListMessageModule(BotBase(), CreateListMessage(chat, text, button, footer, title, mention, id, user, fromMe, selected, mentions, timestamp));
}

export function ListMessageClient<CLIENT extends ClientType>(
  client: CLIENT,
  chat: IChat | string,
  text: string,
  button: string,
  footer?: string,
  title?: string,
  mention?: IMessage,
  id?: string,
  user?: IUser | string,
  fromMe?: boolean,
  selected?: string,
  mentions?: string[],
  timestamp?: Number | Long
): ListMessageModule {
  return ListMessageModule(client, CreateListMessage(chat, text, button, footer, title, mention, id, user, fromMe, selected, mentions, timestamp));
}

export function ListMessageModule<CLIENT extends ClientType, MSG extends IListMessage>(client: CLIENT, message: MSG): MSG & IMessageModule {
  const module: MSG & IMessageModule = {
    ...MessageModule(client, message),
  };

  return module;
}
