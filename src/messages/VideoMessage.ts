import { IVideoMessage, IMessage, IMessageModule } from "@interfaces/Messages";
import { IUser } from "@interfaces/User";
import { IChat } from "@interfaces/Chat";

import { MediaMessageModule } from "@messages/MediaMessage";

import { ClientType } from "@modules/Client";
import BotBase from "@modules/BotBase";

export type VideoMessageModule = IVideoMessage & IMessageModule;

export type VideoMessage = VideoMessageModule;

export function CreateVideoMessage(
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
): IVideoMessage {
  return {
    ...CreateVideoMessage(chat, text, file, mention, id, user, fromMe, selected, mentions, timestamp),
    getVideo() {
      return this.getStream(this.file);
    },
  };
}

export function VideoMessage(
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
): VideoMessageModule {
  return VideoMessageModule(BotBase(), CreateVideoMessage(chat, text, file, mention, id, user, fromMe, selected, mentions, timestamp));
}

export function VideoMessageClient<CLIENT extends ClientType>(
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
): VideoMessageModule {
  return VideoMessageModule(client, CreateVideoMessage(chat, text, file, mention, id, user, fromMe, selected, mentions, timestamp));
}

export function VideoMessageModule<CLIENT extends ClientType, MSG extends IVideoMessage>(client: CLIENT, message: MSG): MSG & IMessageModule {
  const module: MSG & IMessageModule = {
    ...message,
    ...MediaMessageModule(client, message),
  };

  return module;
}
