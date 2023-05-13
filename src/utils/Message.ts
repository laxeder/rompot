import { MessageType } from "@enums/Message";

import { IMediaMessage, IMessage } from "@interfaces/IMessage";

import {
  FileMessage,
  ImageMessage,
  VideoMessage,
  StickerMessage,
  AudioMessage,
  Message,
  ButtonMessage,
  ContactMessage,
  ListMessage,
  EmptyMessage,
  ReactionMessage,
  LocationMessage,
  PollMessage,
  PollUpdateMessage,
} from "@messages/index";

export function isMessage(message: any): message is IMessage {
  return typeof message == "object" && message.hasOwnProperty("text") && message.hasOwnProperty("chat") && message.hasOwnProperty("type");
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

export function isFileMessage(message: any): message is FileMessage {
  return isMediaMessage(message) && message.type == MessageType.File;
}

export function isImageMessage(message: any): message is ImageMessage {
  return isMediaMessage(message) && message.type == MessageType.Image;
}

export function isVideoMessage(message: any): message is VideoMessage {
  return isMediaMessage(message) && message.type == MessageType.Video;
}

export function isStickerMessage(message: any): message is StickerMessage {
  return isMediaMessage(message) && message.type == MessageType.Sticker;
}

export function isAudioMessage(message: any): message is AudioMessage {
  return isMediaMessage(message) && message.type == MessageType.Audio;
}

export function isTextMessage(message: any): message is Message {
  return isMessage(message) && message.type == MessageType.Text;
}

export function isButtonMessage(message: any): message is ButtonMessage {
  return (isMessage(message) && message.type == MessageType.Button) || message.type == MessageType.TemplateButton;
}

export function isButtonTemplateMessage(message: any): message is ButtonMessage {
  return isMessage(message) && message.type == MessageType.TemplateButton;
}

export function isContactMessage(message: any): message is ContactMessage {
  return isMessage(message) && message.type == MessageType.Contact;
}

export function isListMessage(message: any): message is ListMessage {
  return isMessage(message) && message.type == MessageType.List;
}

export function isLocationMessage(message: any): message is LocationMessage {
  return isMessage(message) && message.type == MessageType.Location;
}

export function isPollMessage(message: any): message is PollMessage {
  return isMessage(message) && (message.type == MessageType.Poll || message.type == MessageType.PollUpdate);
}

export function isPollUpdateMessage(message: any): message is PollUpdateMessage {
  return isMessage(message) && message.type == MessageType.PollUpdate;
}

export function isReactionMessage(message: any): message is ReactionMessage {
  return isMessage(message) && message.type == MessageType.Reaction;
}

export function isEmptyMessage(message: any): message is EmptyMessage {
  return isMessage(message) && message.type == MessageType.Empty;
}
