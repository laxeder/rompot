import TelegramBotAPI from "node-telegram-bot-api";

import Message, { MessageStatus, MessageType } from "../messages/Message";
import LocationMessage from "../messages/LocationMessage";
import ReactionMessage from "../messages/ReactionMessage";
import ContactMessage from "../messages/ContactMessage";
import StickerMessage from "../messages/StickerMessage";
import MediaMessage from "../messages/MediaMessage";
import ImageMessage from "../messages/ImageMessage";
import AudioMessage from "../messages/AudioMessage";
import VideoMessage from "../messages/VideoMessage";
import EmptyMessage from "../messages/EmptyMessage";
import TextMessage from "../messages/TextMessage";
import FileMessage from "../messages/FileMessage";
import PollMessage from "../messages/PollMessage";

import User from "../user/User";

import { TelegramUtils } from "./TelegramUtils";

export default class TelegramToRompotConverter {
  public telegramMessage: TelegramBotAPI.Message;
  public rompotMessage: Message;

  constructor(telegramMessage: TelegramBotAPI.Message) {
    this.telegramMessage = telegramMessage;
    this.rompotMessage = new EmptyMessage();
  }

  public async convert(received?: boolean): Promise<Message> {
    if (!this.telegramMessage || typeof this.telegramMessage != "object") {
      return this.rompotMessage;
    }

    this.rompotMessage.chat.id = TelegramUtils.getId(this.telegramMessage.chat);
    this.rompotMessage.chat.name = TelegramUtils.getName(this.telegramMessage.chat);
    this.rompotMessage.chat.type = TelegramUtils.getChatType(this.telegramMessage.chat);
    this.rompotMessage.chat.nickname = TelegramUtils.getNickname(this.telegramMessage.chat);
    this.rompotMessage.chat.phoneNumber = TelegramUtils.getPhoneNumber(this.telegramMessage.chat.id);

    this.rompotMessage.user.id = TelegramUtils.getId(this.telegramMessage.from!);
    this.rompotMessage.user.name = TelegramUtils.getName(this.telegramMessage.from!);
    this.rompotMessage.user.nickname = TelegramUtils.getNickname(this.telegramMessage.from!);
    this.rompotMessage.user.phoneNumber = TelegramUtils.getPhoneNumber(this.telegramMessage.from!.id);

    this.rompotMessage.id = `${this.telegramMessage.message_id}`;
    this.rompotMessage.text = `${this.telegramMessage.text || this.telegramMessage.caption || ""}`;
    this.rompotMessage.mentions = TelegramUtils.getMessageMentions(this.telegramMessage);

    this.rompotMessage.isEdited = !!this.telegramMessage.edit_date;

    if (received) {
      this.rompotMessage.status = MessageStatus.Sended;
      this.rompotMessage.timestamp = Number(this.telegramMessage.date || 0) * 1000;
      this.rompotMessage.chat.timestamp = this.rompotMessage.timestamp;
    }

    if (this.telegramMessage.reply_to_message) {
      const convertor = new TelegramToRompotConverter(this.telegramMessage.reply_to_message);

      this.rompotMessage.mention = await convertor.convert(received);
    }

    this.convertText();
    this.convertMedia();
    this.convertAnimantion();
    this.convertPhoto();
    this.convertVideo();
    this.convertAudio();
    this.convertVoice();
    this.convertDocument();
    this.convertSticker();
    this.convertContact();
    this.convertDice();
    this.convertLocation();
    this.convertVenue();
    this.convertPoll();

    return this.rompotMessage;
  }

  public convertText() {
    if (!this.telegramMessage.hasOwnProperty("text")) return;

    this.rompotMessage = TextMessage.fromJSON({
      ...this.rompotMessage,
      type: MessageType.Text,
      text: TelegramUtils.getText(this.telegramMessage),
    });
  }

  public convertMedia() {
    if (!this.telegramMessage.hasOwnProperty("caption")) return;

    this.rompotMessage = MediaMessage.fromJSON({
      ...this.rompotMessage,
      type: MessageType.Media,
      text: TelegramUtils.getText(this.telegramMessage),
    });
  }

  public convertAnimantion() {
    if (!this.telegramMessage.animation) return;

    this.rompotMessage = ImageMessage.fromJSON({
      ...this.rompotMessage,
      isGIF: true,
      type: MessageType.Image,
      mimeType: this.telegramMessage.animation.mime_type,
      name: this.telegramMessage.animation.file_name,
      file: { stream: this.telegramMessage.animation },
    });
  }

  public convertPhoto() {
    if (!this.telegramMessage.photo) return;

    this.rompotMessage = ImageMessage.fromJSON({
      ...this.rompotMessage,
      type: MessageType.Image,
      file: { stream: this.telegramMessage.photo[this.telegramMessage.photo.length - 1 || 0] || {} },
    });
  }

  public convertVideo() {
    if (!this.telegramMessage.video) return;

    this.rompotMessage = VideoMessage.fromJSON({
      ...this.rompotMessage,
      type: MessageType.Video,
      mimeType: this.telegramMessage.video.mime_type,
      duration: this.telegramMessage.video.duration,
      file: { stream: this.telegramMessage.video },
    });
  }

  public convertAudio() {
    if (!this.telegramMessage.audio) return;

    this.rompotMessage = AudioMessage.fromJSON({
      ...this.rompotMessage,
      type: MessageType.Audio,
      mimeType: this.telegramMessage.audio.mime_type,
      duration: this.telegramMessage.audio.duration,
      name: this.telegramMessage.audio.title,
      file: { stream: this.telegramMessage.audio },
    });
  }

  public convertVoice() {
    if (!this.telegramMessage.voice) return;

    this.rompotMessage = AudioMessage.fromJSON({
      ...this.rompotMessage,
      isPTT: true,
      type: MessageType.Audio,
      mimeType: this.telegramMessage.voice.mime_type,
      duration: this.telegramMessage.voice.duration,
      file: { stream: this.telegramMessage.voice },
    });
  }

  public convertDocument() {
    if (!this.telegramMessage.document) return;

    this.rompotMessage = FileMessage.fromJSON({
      ...this.rompotMessage,
      type: MessageType.File,
      mimeType: this.telegramMessage.document.mime_type,
      name: this.telegramMessage.document.file_name,
      file: { stream: this.telegramMessage.document },
    });
  }

  public convertSticker() {
    if (!this.telegramMessage.sticker) return;

    this.rompotMessage = StickerMessage.fromJSON({
      ...this.rompotMessage,
      type: MessageType.Sticker,
      isGIF: !!(this.telegramMessage.sticker.is_animated || this.telegramMessage.sticker.is_video),
      categories: this.telegramMessage.sticker.emoji ? [this.telegramMessage.sticker.emoji] : [],
      author: `${this.telegramMessage.sticker.set_name || ""}`,
      stickerId: `${this.telegramMessage.sticker.custom_emoji_id || ""}`,
      file: { stream: this.telegramMessage.sticker },
    });
  }

  public convertContact() {
    if (!this.telegramMessage.contact) return;

    this.rompotMessage = ContactMessage.fromJSON({
      ...this.rompotMessage,
      type: MessageType.Contact,
      users: [new User(TelegramUtils.getId(this.telegramMessage.contact), TelegramUtils.getName(this.telegramMessage.contact))],
    });
  }

  public convertDice() {
    if (!this.telegramMessage.dice) return;

    this.rompotMessage = ReactionMessage.fromJSON({
      ...this.rompotMessage,
      type: MessageType.Reaction,
      text: this.telegramMessage.dice.emoji,
    });
  }

  public convertLocation() {
    if (!this.telegramMessage.location) return;

    this.rompotMessage = LocationMessage.fromJSON({
      ...this.rompotMessage,
      type: MessageType.Location,
      latitude: this.telegramMessage.location.latitude,
      longitude: this.telegramMessage.location.longitude,
    });
  }

  public convertVenue() {
    if (!this.telegramMessage.venue) return;

    this.rompotMessage = LocationMessage.fromJSON({
      ...this.rompotMessage,
      type: MessageType.Location,
      latitude: this.telegramMessage.venue.location.latitude,
      longitude: this.telegramMessage.venue.location.longitude,
    });
  }

  public convertPoll() {
    if (!this.telegramMessage.poll) return;

    this.rompotMessage = PollMessage.fromJSON({
      ...this.rompotMessage,
      type: MessageType.Poll,
      text: this.telegramMessage.poll.question,
      options: this.telegramMessage.poll.options.map((option) => {
        return { id: option.text, name: option.text };
      }),
    });
  }
}
