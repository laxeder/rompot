import { IAudioMessage, IMessage, IMessageModule } from "@interfaces/Messages";
import { IUser } from "@interfaces/User";
import { IChat } from "@interfaces/Chat";

import { MediaMessageModule } from "@messages/MediaMessage";

import { ClientType } from "@modules/Client";
import BotBase from "@modules/BotBase";

export type AudioMessageModule = IAudioMessage & IMessageModule;

export type AudioMessage = AudioMessageModule;

export function CreateAudioMessage(
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
): IAudioMessage {
  return {
    ...CreateAudioMessage(chat, text, file, mention, id, user, fromMe, selected, mentions, timestamp),
    getAudio() {
      return this.getStream(this.file);
    },
  };
}

export function AudioMessage(
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
): AudioMessageModule {
  return AudioMessageModule(BotBase(), CreateAudioMessage(chat, text, file, mention, id, user, fromMe, selected, mentions, timestamp));
}

export function AudioMessageClient<CLIENT extends ClientType>(
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
): AudioMessageModule {
  return AudioMessageModule(client, CreateAudioMessage(chat, text, file, mention, id, user, fromMe, selected, mentions, timestamp));
}

export function AudioMessageModule<CLIENT extends ClientType, MSG extends IAudioMessage>(client: CLIENT, message: MSG): MSG & IMessageModule {
  const module: MSG & IMessageModule = {
    ...message,
    ...MediaMessageModule(client, message),
  };

  return module;
}
