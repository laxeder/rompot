import TelegramBotAPI from "node-telegram-bot-api";

import LocationMessage from "../messages/LocationMessage";
import ReactionMessage from "../messages/ReactionMessage";
import ContactMessage from "../messages/ContactMessage";
import StickerMessage from "../messages/StickerMessage";
import MediaMessage from "../messages/MediaMessage";
import ImageMessage from "../messages/ImageMessage";
import AudioMessage from "../messages/AudioMessage";
import VideoMessage from "../messages/VideoMessage";
import TextMessage from "../messages/TextMessage";
import FileMessage from "../messages/FileMessage";
import PollMessage from "../messages/PollMessage";
import Message from "../messages/Message";

import TelegramToRompotConverter from "./TelegramToRompotConverter";
import { TelegramUtils } from "./TelegramUtils";
import TelegramBot from "./TelegramBot";

export default class TelegramSendingController {
  public telegram: TelegramBot;

  constructor(telegram: TelegramBot) {
    this.telegram = telegram;
  }

  public async send(message: Message): Promise<Message> {
    if (TextMessage.isValid(message)) {
      return await this.sendText(message);
    }

    if (ReactionMessage.isValid(message)) {
      return await this.sendReaction(message);
    }

    if (ContactMessage.isValid(message)) {
      return await this.sendContact(message);
    }

    if (LocationMessage.isValid(message)) {
      return await this.sendLocation(message);
    }

    if (PollMessage.isValid(message)) {
      return await this.sendPoll(message);
    }

    if (AudioMessage.isValid(message)) {
      return await this.sendAudio(message);
    }

    if (ImageMessage.isValid(message)) {
      return await this.sendImage(message);
    }

    if (VideoMessage.isValid(message)) {
      return await this.sendVideo(message);
    }

    if (StickerMessage.isValid(message)) {
      return await this.sendSticker(message);
    }

    if (FileMessage.isValid(message)) {
      return await this.sendFile(message);
    }

    if (MediaMessage.isValid(message)) {
      return await this.sendMedia(message);
    }

    return await this.sendMessage(message);
  }

  public async sendMessage(message: Message): Promise<Message> {
    const options = TelegramSendingController.getOptions(message);

    const telegramMessage = await this.telegram.bot.sendMessage(Number(message.chat.id), `${message.text}`, options);

    return await new TelegramToRompotConverter(telegramMessage).convert();
  }

  public async sendText(message: TextMessage): Promise<Message> {
    const options = TelegramSendingController.getOptions(message);

    const telegramMessage = await this.telegram.bot.sendMessage(Number(message.chat.id), `${message.text}`, options);

    return await new TelegramToRompotConverter(telegramMessage).convert();
  }

  public async sendReaction(message: ReactionMessage): Promise<Message> {
    const options = TelegramSendingController.getOptions(message);

    const telegramMessage = await this.telegram.bot.sendDice(Number(message.chat.id), options);

    return await new TelegramToRompotConverter(telegramMessage).convert();
  }

  public async sendContact(message: ContactMessage): Promise<Message> {
    const options = TelegramSendingController.getOptions(message);

    const telegramMessage = await this.telegram.bot.sendContact(Number(message.chat.id), TelegramUtils.getPhoneNumber(message.contacts.shift()?.id || ""), `${message.text}`, options);

    return await new TelegramToRompotConverter(telegramMessage).convert();
  }

  public async sendLocation(message: LocationMessage): Promise<Message> {
    const options = TelegramSendingController.getOptions(message);

    const telegramMessage = await this.telegram.bot.sendLocation(Number(message.chat.id), Number(message.latitude || 0), Number(message.longitude || 0), options);

    return await new TelegramToRompotConverter(telegramMessage).convert();
  }

  public async sendPoll(message: PollMessage): Promise<Message> {
    const options = TelegramSendingController.getOptions(message);

    const telegramMessage = await this.telegram.bot.sendPoll(
      Number(message.chat.id),
      `${message.text}`,
      message.options.map((option) => `${option.name || ""}`),
      options
    );

    return await new TelegramToRompotConverter(telegramMessage).convert();
  }

  public async sendAudio(message: AudioMessage): Promise<Message> {
    const options = TelegramSendingController.getOptions(message);
    const fileOptions = TelegramSendingController.getFileOptions(message);

    if (message.isPTT) {
      var telegramMessage = await this.telegram.bot.sendVoice(Number(message.chat.id), await message.getStream(), options, fileOptions);
    } else {
      var telegramMessage = await this.telegram.bot.sendAudio(Number(message.chat.id), await message.getStream(), options, fileOptions);
    }

    return await new TelegramToRompotConverter(telegramMessage).convert();
  }

  public async sendImage(message: ImageMessage): Promise<Message> {
    const options = TelegramSendingController.getOptions(message);
    const fileOptions = TelegramSendingController.getFileOptions(message);

    if (message.isGIF) {
      var telegramMessage = await this.telegram.bot.sendAnimation(Number(message.chat.id), await message.getStream(), options);
    } else {
      var telegramMessage = await this.telegram.bot.sendPhoto(Number(message.chat.id), await message.getStream(), options, fileOptions);
    }

    return await new TelegramToRompotConverter(telegramMessage).convert();
  }

  public async sendVideo(message: VideoMessage): Promise<Message> {
    const options = TelegramSendingController.getOptions(message);
    const fileOptions = TelegramSendingController.getFileOptions(message);

    const telegramMessage = await this.telegram.bot.sendVideo(Number(message.chat.id), await message.getStream(), options, fileOptions);

    return await new TelegramToRompotConverter(telegramMessage).convert();
  }

  public async sendSticker(message: StickerMessage): Promise<Message> {
    const options = TelegramSendingController.getOptions(message);
    const fileOptions = TelegramSendingController.getFileOptions(message);

    const telegramMessage = await this.telegram.bot.sendSticker(Number(message.chat.id), await message.getStream(), options, fileOptions);

    return await new TelegramToRompotConverter(telegramMessage).convert();
  }

  public async sendFile(message: FileMessage): Promise<Message> {
    const options = TelegramSendingController.getOptions(message);
    const fileOptions = TelegramSendingController.getFileOptions(message);

    const telegramMessage = await this.telegram.bot.sendDocument(Number(message.chat.id), await message.getStream(), options, fileOptions);

    return await new TelegramToRompotConverter(telegramMessage).convert();
  }

  public async sendMedia(message: MediaMessage): Promise<Message> {
    const options = TelegramSendingController.getOptions(message);
    const fileOptions = TelegramSendingController.getFileOptions(message);

    const telegramMessage = await this.telegram.bot.sendDocument(Number(message.chat.id), await message.getStream(), options, fileOptions);

    return await new TelegramToRompotConverter(telegramMessage).convert();
  }

  public async sendEditedMessage(message: Message): Promise<void> {
    const options = TelegramSendingController.getOptions(message);

    if (MediaMessage.isValid(message)) {
      await this.telegram.bot.editMessageCaption(message.text, options);
    } else {
      await this.telegram.bot.editMessageText(message.text, options);
    }
  }

  public static getOptions(
    message: Message,
    options: TelegramBotAPI.SendBasicOptions &
      TelegramBotAPI.SendAudioOptions &
      TelegramBotAPI.SendVoiceOptions &
      TelegramBotAPI.SendAnimationOptions &
      TelegramBotAPI.SendVideoOptions &
      TelegramBotAPI.SendDocumentOptions &
      TelegramBotAPI.SendContactOptions &
      TelegramBotAPI.SendLocationOptions &
      TelegramBotAPI.SendPollOptions &
      TelegramBotAPI.SendDiceOptions &
      TelegramBotAPI.EditMessageTextOptions = {}
  ) {
    options.chat_id = Number(message.chat.id || 0);
    options.message_id = Number(message.id || 0);

    options.caption_entities = message.mentions.reduce((entities, mention) => {
      const result = new RegExp(`@(${mention || ""})`).exec(`${message.text || ""}`);

      const searchedMention = result?.shift();

      if (searchedMention) {
        entities.push({ type: "mention", offset: result?.index || 0, length: searchedMention.length });
      }

      return entities;
    }, [] as TelegramBotAPI.MessageEntity[]);

    if (message.mention) {
      options.reply_to_message_id = Number(message.mention.id || 0);
    }

    if (MediaMessage.isValid(message)) {
      options.caption = `${message.text || ""}`;
      options.title = `${message.name || ""}`;

      if (AudioMessage.isValid(message)) {
        options.duration = Number(message.duration || 0);
      }
    } else if (ReactionMessage.isValid(message)) {
      options.emoji = `${message.text || ""}`;
    }

    return options;
  }

  public static getFileOptions(message: MediaMessage, options: TelegramBotAPI.FileOptions = {}) {
    options.filename = `${message.name || ""}`;
    options.contentType = `${message.mimetype || ""}`;

    return options;
  }
}
