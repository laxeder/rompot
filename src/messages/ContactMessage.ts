import { IContactMessage, IMessage, IMessageModule } from "@interfaces/Messages";
import { IUser } from "@interfaces/User";
import { IChat } from "@interfaces/Chat";

import { CreateMessage, MessageModule } from "@messages/Message";

import { ClientType } from "@modules/Client";
import BotBase from "@modules/BotBase";

export type ContactMessageModule = IContactMessage & IMessageModule;

export type ContactMessage = ContactMessageModule;

export function CreateContactMessage(
  chat: IChat | string,
  text: string,
  contacts: string | string[],
  mention?: IMessage,
  id?: string,
  user?: IUser | string,
  fromMe?: boolean,
  selected?: string,
  mentions?: string[],
  timestamp?: Number | Long
): IContactMessage {
  return {
    ...CreateMessage(chat, text, mention, id, user, fromMe, selected, mentions, timestamp),
    contacts: typeof contacts == "string" ? [contacts] : contacts,
  };
}

export function ContactMessage(
  chat: IChat | string,
  text: string,
  contacts: string | string[],
  mention?: IMessage,
  id?: string,
  user?: IUser | string,
  fromMe?: boolean,
  selected?: string,
  mentions?: string[],
  timestamp?: Number | Long
): ContactMessageModule {
  return ContactMessageModule(BotBase(), CreateContactMessage(chat, text, contacts, mention, id, user, fromMe, selected, mentions, timestamp));
}

export function ContactMessageClient<CLIENT extends ClientType>(
  client: CLIENT,
  chat: IChat | string,
  text: string,
  contacts: string | string[],
  mention?: IMessage,
  id?: string,
  user?: IUser | string,
  fromMe?: boolean,
  selected?: string,
  mentions?: string[],
  timestamp?: Number | Long
): ContactMessageModule {
  return ContactMessageModule(client, CreateContactMessage(chat, text, contacts, mention, id, user, fromMe, selected, mentions, timestamp));
}

export function ContactMessageModule<CLIENT extends ClientType, MSG extends IContactMessage>(client: CLIENT, message: MSG): MSG & IMessageModule {
  const module: MSG & IMessageModule = {
    ...MessageModule(client, message),
  };

  return module;
}
