import PollUpdateMessage from "../messages/PollUpdateMessage";
import Message, { MessageType } from "../messages/Message";
import LocationMessage from "../messages/LocationMessage";
import ReactionMessage from "../messages/ReactionMessage";
import ContactMessage from "../messages/ContactMessage";
import StickerMessage from "../messages/StickerMessage";
import ButtonMessage from "../messages/ButtonMessage";
import VideoMessage from "../messages/VideoMessage";
import MediaMessage from "../messages/MediaMessage";
import ImageMessage from "../messages/ImageMessage";
import AudioMessage from "../messages/AudioMessage";
import EmptyMessage from "../messages/EmptyMessage";
import ErrorMessage from "../messages/ErrorMessage";
import FileMessage from "../messages/FileMessage";
import ListMessage from "../messages/ListMessage";
import PollMessage from "../messages/PollMessage";
import TextMessage from "../messages/TextMessage";

export function getMessageFromJSON(data: any) {
  if (!data || typeof data != "object" || data?.type == MessageType.Empty) {
    return EmptyMessage.fromJSON(data);
  }

  if (data?.type == MessageType.Audio) {
    return AudioMessage.fromJSON(data);
  }

  if (data?.type == MessageType.Button) {
    return ButtonMessage.fromJSON(data);
  }

  if (data?.type == MessageType.Contact) {
    return ContactMessage.fromJSON(data);
  }

  if (data?.type == MessageType.Error) {
    return ErrorMessage.fromJSON(data);
  }

  if (data?.type == MessageType.File) {
    return FileMessage.fromJSON(data);
  }

  if (data?.type == MessageType.Image) {
    return ImageMessage.fromJSON(data);
  }

  if (data?.type == MessageType.List) {
    return ListMessage.fromJSON(data);
  }

  if (data?.type == MessageType.Location) {
    return LocationMessage.fromJSON(data);
  }

  if (data?.type == MessageType.Media) {
    return MediaMessage.fromJSON(data);
  }

  if (data?.type == MessageType.Text) {
    return TextMessage.fromJSON(data);
  }

  if (data?.type == MessageType.Poll) {
    return PollMessage.fromJSON(data);
  }

  if (data?.type == MessageType.PollUpdate) {
    return PollUpdateMessage.fromJSON(data);
  }

  if (data?.type == MessageType.Reaction) {
    return ReactionMessage.fromJSON(data);
  }

  if (data?.type == MessageType.Sticker) {
    return StickerMessage.fromJSON(data);
  }

  if (data?.type == MessageType.Video) {
    return VideoMessage.fromJSON(data);
  }

  return Message.fromJSON(data);
}
