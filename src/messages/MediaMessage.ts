import { IMediaMessage, IMessage, IMessageModule } from "@interfaces/Messages";
import { IUser } from "@interfaces/User";
import { IChat } from "@interfaces/Chat";

import { CreateMessage, MessageModule } from "@messages/Message";

import { ClientType } from "@modules/Client";
import BotBase from "@modules/BotBase";

export type MediaMessageModule = IMediaMessage & IMessageModule;

export type MediaMessage = MediaMessageModule;

export function CreateMediaMessage(
  chat: IChat | string,
  text: string,
  file: any,
  mention?: IMessage,
  id?: string,
  user?: IUser | string,
  fromMe?: boolean,
  selected?: string,
  mentions?: string[],
  timestamp?: Number | Long
): IMediaMessage {
  return {
    ...CreateMessage(chat, text, mention, id, user, fromMe, selected, mentions, timestamp),
    isGIF: false,
    file: file || Buffer.from(""),
    getStream: (f: any) => f || file,
  };
}

export function MediaMessage(
  chat: IChat | string,
  text: string,
  file: any,
  mention?: IMessage,
  id?: string,
  user?: IUser | string,
  fromMe?: boolean,
  selected?: string,
  mentions?: string[],
  timestamp?: Number | Long
): MediaMessageModule {
  return MediaMessageModule(BotBase(), CreateMediaMessage(chat, text, file, mention, id, user, fromMe, selected, mentions, timestamp));
}

export function MediaMessageClient<CLIENT extends ClientType>(
  client: CLIENT,
  chat: IChat | string,
  text: string,
  file: any,
  mention?: IMessage,
  id?: string,
  user?: IUser | string,
  fromMe?: boolean,
  selected?: string,
  mentions?: string[],
  timestamp?: Number | Long
): MediaMessageModule {
  return MediaMessageModule(client, CreateMediaMessage(chat, text, file, mention, id, user, fromMe, selected, mentions, timestamp));
}

export function MediaMessageModule<CLIENT extends ClientType, MSG extends IMediaMessage>(client: CLIENT, message: MSG): MSG & IMessageModule {
  const module: MSG & IMessageModule = {
    ...MessageModule(client, message),
  };

  return module;
}
