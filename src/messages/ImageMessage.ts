import { IImageMessage, IMessage, IMessageModule } from "@interfaces/Messages";
import { IUser } from "@interfaces/User";
import { IChat } from "@interfaces/Chat";

import { MediaMessageModule } from "@messages/MediaMessage";

import { ClientType } from "@modules/Client";
import BotBase from "@modules/BotBase";

export type ImageMessageModule = IImageMessage & IMessageModule;

export type ImageMessage = ImageMessageModule;

export function CreateImageMessage(
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
): IImageMessage {
  return {
    ...CreateImageMessage(chat, text, file, mention, id, user, fromMe, selected, mentions, timestamp),
    getImage() {
      return this.getStream(this.file);
    },
  };
}

export function ImageMessage(
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
): ImageMessageModule {
  return ImageMessageModule(BotBase(), CreateImageMessage(chat, text, file, mention, id, user, fromMe, selected, mentions, timestamp));
}

export function ImageMessageClient<CLIENT extends ClientType>(
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
): ImageMessageModule {
  return ImageMessageModule(client, CreateImageMessage(chat, text, file, mention, id, user, fromMe, selected, mentions, timestamp));
}

export function ImageMessageModule<CLIENT extends ClientType, MSG extends IImageMessage>(client: CLIENT, message: MSG): MSG & IMessageModule {
  const module: MSG & IMessageModule = {
    ...message,
    ...MediaMessageModule(client, message),
  };

  return module;
}
