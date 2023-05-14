import { MessageType } from "@enums/Message";

import { ICommand } from "@interfaces/ICommand";
import { IChat } from "@interfaces/IChat";
import { IUser } from "@interfaces/IUser";

import {
  IAudioMessage,
  IButtonMessage,
  IContactMessage,
  IEmptyMessage,
  IFileMessage,
  IImageMessage,
  IListMessage,
  ILocationMessage,
  IMediaMessage,
  IMessage,
  IPollMessage,
  IPollUpdateMessage,
  IReactionMessage,
  IStickerMessage,
  IVideoMessage,
} from "@interfaces/IMessage";
import { IAuth } from "@interfaces/IAuth";

export function isChat(chat: any): chat is IChat {
  return typeof chat === "object" && chat.hasOwnProperty("id") && chat.hasOwnProperty("type");
}

export function isUser(user: any): user is IUser {
  return typeof user === "object" && user.hasOwnProperty("id");
}

export function isCommand(command: any): command is ICommand {
  return typeof command === "object" && command.hasOwnProperty("execute") && command.hasOwnProperty("response");
}

export function isAuth(auth: any): auth is IAuth {
  return typeof auth === "object" && auth.hasOwnProperty("get") && auth.hasOwnProperty("set") && auth.hasOwnProperty("remove") && auth.hasOwnProperty("listAll");
}

export function isMessage(message: any): message is IMessage {
  return typeof message == "object" && message.hasOwnProperty("text") && message.hasOwnProperty("chat") && message.hasOwnProperty("type");
}

export function isTextMessage(message: any): message is IMessage {
  return isMessage(message) && message.type == MessageType.Text;
}

export function isButtonMessage(message: any): message is IButtonMessage {
  return (isMessage(message) && message.type == MessageType.Button) || message.type == MessageType.TemplateButton;
}

export function isButtonTemplateMessage(message: any): message is IButtonMessage {
  return isMessage(message) && message.type == MessageType.TemplateButton;
}

export function isContactMessage(message: any): message is IContactMessage {
  return isMessage(message) && message.type == MessageType.Contact;
}

export function isListMessage(message: any): message is IListMessage {
  return isMessage(message) && message.type == MessageType.List;
}

export function isLocationMessage(message: any): message is ILocationMessage {
  return isMessage(message) && message.type == MessageType.Location;
}

export function isPollMessage(message: any): message is IPollMessage {
  return isMessage(message) && (message.type == MessageType.Poll || message.type == MessageType.PollUpdate);
}

export function isPollUpdateMessage(message: any): message is IPollUpdateMessage {
  return isMessage(message) && message.type == MessageType.PollUpdate;
}

export function isReactionMessage(message: any): message is IReactionMessage {
  return isMessage(message) && message.type == MessageType.Reaction;
}

export function isEmptyMessage(message: any): message is IEmptyMessage {
  return isMessage(message) && message.type == MessageType.Empty;
}

export function isMediaMessage(message: any): message is IMediaMessage {
  return (
    isMessage(message) &&
    (message.type == MessageType.Media ||
      message.type == MessageType.File ||
      message.type == MessageType.Image ||
      message.type == MessageType.Video ||
      message.type == MessageType.Sticker ||
      message.type == MessageType.Audio)
  );
}

export function isFileMessage(message: any): message is IFileMessage {
  return isMediaMessage(message) && message.type == MessageType.File;
}

export function isImageMessage(message: any): message is IImageMessage {
  return isMediaMessage(message) && message.type == MessageType.Image;
}

export function isVideoMessage(message: any): message is IVideoMessage {
  return isMediaMessage(message) && message.type == MessageType.Video;
}

export function isStickerMessage(message: any): message is IStickerMessage {
  return isMediaMessage(message) && message.type == MessageType.Sticker;
}

export function isAudioMessage(message: any): message is IAudioMessage {
  return isMediaMessage(message) && message.type == MessageType.Audio;
}
