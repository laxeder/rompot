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
    var message: Message = AudioMessage.fromJSON(data);
  } else if (data?.type == MessageType.Button) {
    var message: Message = ButtonMessage.fromJSON(data);
  } else if (data?.type == MessageType.Contact) {
    var message: Message = ContactMessage.fromJSON(data);
  } else if (data?.type == MessageType.Error) {
    var message: Message = ErrorMessage.fromJSON(data);
  } else if (data?.type == MessageType.File) {
    var message: Message = FileMessage.fromJSON(data);
  } else if (data?.type == MessageType.Image) {
    var message: Message = ImageMessage.fromJSON(data);
  } else if (data?.type == MessageType.List) {
    var message: Message = ListMessage.fromJSON(data);
  } else if (data?.type == MessageType.Location) {
    var message: Message = LocationMessage.fromJSON(data);
  } else if (data?.type == MessageType.Media) {
    var message: Message = MediaMessage.fromJSON(data);
  } else if (data?.type == MessageType.Text) {
    var message: Message = TextMessage.fromJSON(data);
  } else if (data?.type == MessageType.Poll) {
    var message: Message = PollMessage.fromJSON(data);
  } else if (data?.type == MessageType.PollUpdate) {
    var message: Message = PollUpdateMessage.fromJSON(data);
  } else if (data?.type == MessageType.Reaction) {
    var message: Message = ReactionMessage.fromJSON(data);
  } else if (data?.type == MessageType.Sticker) {
    var message: Message = StickerMessage.fromJSON(data);
  } else if (data?.type == MessageType.Video) {
    var message: Message = VideoMessage.fromJSON(data);
  } else {
    var message: Message = Message.fromJSON(data);
  }

  if (message.mention) {
    message.mention = getMessageFromJSON(message.mention);
  }

  return message;
}
