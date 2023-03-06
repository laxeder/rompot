import { IButtonMessage, IMessage, IMessageModule } from "@interfaces/Messages";
import { IUser } from "@interfaces/User";
import { IChat } from "@interfaces/Chat";

import { CreateMessage, MessageModule } from "@messages/Message";

import { ClientType } from "@modules/Client";
import BotBase from "@modules/BotBase";

export type ButtonMessageModule = IButtonMessage & IMessageModule;

export type ButtonMessage = ButtonMessageModule;

export function CreateButtonMessage(
  chat: IChat | string,
  text: string,
  footer?: string,
  mention?: IMessage,
  id?: string,
  user?: IUser | string,
  fromMe?: boolean,
  selected?: string,
  mentions?: string[],
  timestamp?: Number | Long
): IButtonMessage {
  const msg: IButtonMessage = {
    ...CreateMessage(chat, text, mention, id, user, fromMe, selected, mentions, timestamp),
    footer: footer || "",
    buttons: [],

    addUrl(text: string, url: string, index: number = msg.buttons.length + 1) {
      this.buttons.push({ index, type: "url", text, content: url });
    },

    addCall(text: string, phone: string, index: number = msg.buttons.length + 1) {
      this.buttons.push({ index, type: "call", text, content: phone });
    },

    addReply(text: string, id: string = String(msg.buttons.length + 1), index: number = msg.buttons.length + 1) {
      this.buttons.push({ index, type: "reply", text, content: id });
    },

    remove(index: number) {
      this.buttons.splice(index);
    },
  };

  return msg;
}

export function ButtonMessage(
  chat: IChat | string,
  text: string,
  footer?: string,
  mention?: IMessage,
  id?: string,
  user?: IUser | string,
  fromMe?: boolean,
  selected?: string,
  mentions?: string[],
  timestamp?: Number | Long
): ButtonMessageModule {
  return ButtonMessageModule(BotBase(), CreateButtonMessage(chat, text, footer, mention, id, user, fromMe, selected, mentions, timestamp));
}

export function ButtonMessageClient<CLIENT extends ClientType>(
  client: CLIENT,
  chat: IChat | string,
  text: string,
  footer?: string,
  mention?: IMessage,
  id?: string,
  user?: IUser | string,
  fromMe?: boolean,
  selected?: string,
  mentions?: string[],
  timestamp?: Number | Long
): ButtonMessageModule {
  return ButtonMessageModule(client, CreateButtonMessage(chat, text, footer, mention, id, user, fromMe, selected, mentions, timestamp));
}

export function ButtonMessageModule<CLIENT extends ClientType, MSG extends IButtonMessage>(client: CLIENT, message: MSG): MSG & IMessageModule {
  const module: MSG & IMessageModule = {
    ...MessageModule(client, message),
  };

  return module;
}
