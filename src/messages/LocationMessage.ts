import { ILocationMessage, IMessage, IMessageModule } from "@interfaces/Messages";
import { IUser } from "@interfaces/User";
import { IChat } from "@interfaces/Chat";

import { CreateMessage, MessageModule } from "@messages/Message";

import { ClientType } from "@modules/Client";
import BotBase from "@modules/BotBase";

export type LocationMessageModule = ILocationMessage & IMessageModule;

export type LocationMessage = LocationMessageModule;

export function CreateLocationMessage(
  chat: IChat | string,
  text: string,
  latitude: number,
  longitude: number,
  mention?: IMessage,
  id?: string,
  user?: IUser | string,
  fromMe?: boolean,
  selected?: string,
  mentions?: string[],
  timestamp?: Number | Long
): ILocationMessage {
  return {
    ...CreateMessage(chat, text, mention, id, user, fromMe, selected, mentions, timestamp),
    latitude: latitude || 0,
    longitude: longitude || 0,
    setLocation(latitude: number, longitude: number) {
      this.latitude = latitude;
      this.longitude = longitude;
    },
  };
}

export function LocationMessage(
  chat: IChat | string,
  text: string,
  latitude: number,
  longitude: number,
  mention?: IMessage,
  id?: string,
  user?: IUser | string,
  fromMe?: boolean,
  selected?: string,
  mentions?: string[],
  timestamp?: Number | Long
): LocationMessageModule {
  return LocationMessageModule(BotBase(), CreateLocationMessage(chat, text, latitude, longitude, mention, id, user, fromMe, selected, mentions, timestamp));
}

export function LocationMessageClient<CLIENT extends ClientType>(
  client: CLIENT,
  chat: IChat | string,
  text: string,
  latitude: number,
  longitude: number,
  mention?: IMessage,
  id?: string,
  user?: IUser | string,
  fromMe?: boolean,
  selected?: string,
  mentions?: string[],
  timestamp?: Number | Long
): LocationMessageModule {
  return LocationMessageModule(client, CreateLocationMessage(chat, text, latitude, longitude, mention, id, user, fromMe, selected, mentions, timestamp));
}

export function LocationMessageModule<CLIENT extends ClientType, MSG extends ILocationMessage>(client: CLIENT, message: MSG): MSG & IMessageModule {
  const module: MSG & IMessageModule = {
    ...MessageModule(client, message),
  };

  return module;
}
