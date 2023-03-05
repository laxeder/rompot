import {
  AudioMessageModule,
  ButtonMessageModule,
  ContactMessageModule,
  IAudioMessage,
  IButtonMessage,
  IContactMessage,
  IImageMessage,
  IListMessage,
  ILocationMessage,
  ImageMessageModule,
  IMediaMessage,
  IMessage,
  IVideoMessage,
  ListMessageModule,
  LocationMessageModule,
  MediaMessageModule,
  MessageModule,
  VideoMessageModule,
} from "@interfaces/Messages";

import { ChatModule } from "@modules/Chat";
import { GenerateUser } from "@modules/User";

import { Client } from "@modules/Client";
import Message from "./Message";

export function GenerateMessage<IMSG extends IMessage>(bot: Client, message: IMSG): IMSG & MessageModule {
  const module: IMSG & MessageModule = {
    ...message,
    mention: undefined,
    chat: ChatModule(bot, message.chat),
    user: GenerateUser(bot, message.user),

    async addReaction(reaction: string): Promise<void> {
      return this.bot.addReaction(this, reaction);
    },

    async reply(message: IMessage | string, mention: boolean = true) {
      const msg = Message.getMessage(message);

      if (mention) msg.mention = this;

      return GenerateMessage(bot, await bot.send(msg));
    },

    async read(): Promise<void> {
      return this.bot.readMessage(this);
    },
  };

  if (message.mention) module.mention = GenerateMessage(bot, message.mention);

  return module;
}

export type MediaMessage = IMediaMessage & MediaMessageModule;

export function GenerateMediaMessage<IMSG extends IMediaMessage>(bot: Client, message: IMSG): IMSG & MediaMessageModule {
  const module: IMSG & MediaMessageModule = {
    ...GenerateMessage(bot, message),
  };

  return module;
}

export type ImageMessage = IImageMessage & ImageMessageModule;

export default function GenerateImageMessage<IMSG extends IImageMessage>(bot: Client, message: IMSG): IMSG & ImageMessageModule {
  const module: IMSG & ImageMessageModule = {
    ...GenerateMessage(bot, message),
    getImage(): Promise<Buffer> {
      return this.getStream(this.file);
    },
  };

  return module;
}

export type VideoMessage = IVideoMessage & VideoMessageModule;

export function GenerateVideoMessage<IMSG extends IVideoMessage>(bot: Client, message: IMSG): IMSG & VideoMessageModule {
  const module: IMSG & VideoMessageModule = {
    ...GenerateMessage(bot, message),
    getVideo(): Promise<Buffer> {
      return this.getStream(this.file);
    },
  };

  return module;
}

export type AudioMessage = IAudioMessage & AudioMessageModule;

export function GenerateAudioMessage<IMSG extends IAudioMessage>(bot: Client, message: IMSG): IMSG & AudioMessageModule {
  const module: IMSG & AudioMessageModule = {
    ...GenerateMessage(bot, message),
    getAudio(): Promise<Buffer> {
      return this.getStream(this.file);
    },
  };

  return module;
}

export type LocationMessage = ILocationMessage & LocationMessageModule;

export function GenerateLocationMessage<IMSG extends ILocationMessage>(bot: Client, message: IMSG): IMSG & LocationMessageModule {
  const module: IMSG & LocationMessageModule = {
    ...GenerateMessage(bot, message),
    setLocation(latitude: number, longitude: number) {
      this.latitude = latitude;
      this.longitude = longitude;
    },
  };

  return module;
}

export type ContactMessage = IContactMessage & ContactMessageModule;

export function GenerateContactMessage<IMSG extends IContactMessage>(bot: Client, message: IMSG): IMSG & ContactMessageModule {
  const module: IMSG & ContactMessageModule = {
    ...GenerateMessage(bot, message),
  };

  return module;
}

export type ListMessage = IListMessage & ListMessageModule;

export function GenerateListMessage<IMSG extends IListMessage>(bot: Client, message: IMSG): IMSG & ListMessageModule {
  const module: IMSG & ListMessageModule = {
    ...GenerateMessage(bot, message),
  };

  return module;
}

export type ButtonMessage = IButtonMessage & ButtonMessageModule;

export function GenerateButtonMessage<IMSG extends IButtonMessage>(bot: Client, message: IMSG): IMSG & ButtonMessageModule {
  const module: IMSG & ButtonMessageModule = {
    ...GenerateMessage(bot, message),
  };

  return module;
}
