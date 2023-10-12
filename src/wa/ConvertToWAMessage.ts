import { generateWAMessage, isJidGroup, MiscMessageGenerationOptions } from "@whiskeysockets/baileys";
import Sticker, { Categories, StickerTypes } from "@laxeder/wa-sticker/dist";

import ListMessage, { List, ListItem } from "../messages/ListMessage";
import Message, { MessageType } from "../messages/Message";
import LocationMessage from "../messages/LocationMessage";
import ReactionMessage from "../messages/ReactionMessage";
import ContactMessage from "../messages/ContactMessage";
import StickerMessage from "../messages/StickerMessage";
import ButtonMessage from "../messages/ButtonMessage";
import MediaMessage from "../messages/MediaMessage";
import ImageMessage from "../messages/ImageMessage";
import AudioMessage from "../messages/AudioMessage";
import VideoMessage from "../messages/VideoMessage";
import FileMessage from "../messages/FileMessage";
import PollMessage from "../messages/PollMessage";

import WhatsAppBot from "./WhatsAppBot";
import { getID } from "./ID";

export class ConvertToWAMessage {
  public message: Message;
  public bot: WhatsAppBot;

  public chatId: string = "";
  public waMessage: any = {};
  public options: MiscMessageGenerationOptions = {};
  public isRelay: boolean = false;

  constructor(wa: WhatsAppBot, message: Message) {
    this.message = message;
    this.bot = wa;
  }

  /**
   * * Refatora a mensagem
   * @param message
   */
  public async refactory(message = this.message): Promise<this> {
    this.waMessage = await this.refactoryMessage(message);
    this.chatId = getID(message.chat.id);

    if (message.mention) {
      const { chatId, waMessage } = await new ConvertToWAMessage(this.bot, message.mention).refactory(message.mention);

      const userJid = getID(!!message.mention.user.id ? message.mention.user.id : this.bot.id);

      this.options.quoted = await generateWAMessage(chatId || this.chatId, waMessage, {
        userJid,
        upload(): any {
          return {};
        },
      });

      this.options.quoted.key.fromMe = userJid == getID(this.bot.id);

      if (this.chatId.includes("@g")) {
        this.options.quoted.key.participant = userJid;
      }
    }

    if (MediaMessage.isValid(message)) await this.refactoryMediaMessage(message);
    if (LocationMessage.isValid(message)) this.refactoryLocationMessage(message);
    if (ReactionMessage.isValid(message)) this.refactoryReactionMessage(message);
    if (ContactMessage.isValid(message)) this.refactoryContactMessage(message);
    if (ButtonMessage.isValid(message)) this.refactoryButtonMessage(message);
    if (ListMessage.isValid(message)) this.refactoryListMessage(message);
    if (PollMessage.isValid(message)) this.refactoryPollMessage(message);

    return this;
  }

  /**
   * * Refatora outras informações da mensagem
   * @param message
   * @returns
   */
  public async refactoryMessage(message: Message) {
    const msg: any = {};

    msg.text = message.text;

    if (!!message.user.id && isJidGroup(message.chat.id)) {
      msg.participant = getID(message.user.id);
    }

    if (message.mentions) {
      msg.mentions = [];

      for (const jid of message.mentions) {
        msg.mentions.push(getID(jid));
      }

      for (const mention of msg.text.split(/@(.*?)/)) {
        const mentionNumber = mention.split(/\s+/)[0].replace(/\D+/g, "");

        if (!!!mentionNumber || mentionNumber.length < 9 || mentionNumber.length > 15) continue;

        const jid = getID(mentionNumber);

        if (msg.mentions.includes(jid)) continue;

        msg.mentions.push(jid);
      }
    }

    if (message.fromMe) msg.fromMe = message.fromMe;
    if (message.id) msg.id = message.id;

    if (message.isEdited) {
      msg.edit = {
        remoteJid: getID(message.chat.id) || "",
        id: message.id || "",
        fromMe: message.fromMe || message.user.id == this.bot.id,
        participant: isJidGroup(message.chat.id) ? getID(message.user.id || this.bot.id) : undefined,
        toJSON: () => this,
      };
    }

    return msg;
  }

  /**
   * * Refatora uma mensagem de midia
   * @param message
   */
  public async refactoryMediaMessage(message: MediaMessage) {
    const stream = await message.getStream();

    if (ImageMessage.isValid(message)) {
      this.waMessage.image = stream;
    }

    if (VideoMessage.isValid(message)) {
      this.waMessage.video = stream;
    }

    if (AudioMessage.isValid(message)) {
      this.waMessage.audio = stream;
    }

    if (FileMessage.isValid(message)) {
      this.waMessage.document = stream;
    }

    if (StickerMessage.isValid(message)) {
      await this.refatoryStickerMessage(message);
    }

    this.waMessage.gifPlayback = !!message?.isGIF;
    this.waMessage.caption = this.waMessage.text;
    this.waMessage.mimetype = message.mimetype;
    this.waMessage.fileName = message.name;

    delete this.waMessage.text;
  }

  public async refatoryStickerMessage(message: StickerMessage) {
    const stickerFile = await message.getSticker();

    this.waMessage = { ...this.waMessage, sticker: stickerFile };

    try {
      const sticker = new Sticker(stickerFile, {
        pack: message.pack,
        author: message.author,
        categories: message.categories as Categories[],
        id: message.stickerId,
        type: StickerTypes.FULL,
        quality: 100,
      });

      this.waMessage = { ...this.waMessage, ...(await sticker.toMessage()) };
    } catch (err) {
      this.bot.ev.emit("error", err);
    }
  }

  public refactoryLocationMessage(message: LocationMessage) {
    this.waMessage.location = { degreesLatitude: message.latitude, degreesLongitude: message.longitude };

    delete this.waMessage.text;
  }

  public refactoryContactMessage(message: ContactMessage) {
    this.waMessage.contacts = {
      displayName: message.text,
      contacts: [],
    };

    for (const user of message.contacts) {
      const vcard =
        "BEGIN:VCARD\n" + "VERSION:3.0\n" + `FN:${""}\n` + (user.description ? `ORG:${user.description};\n` : "") + `TEL;type=CELL;type=VOICE;waid=${user.id}: ${getID(user.id)}\n` + "END:VCARD";

      if (message.contacts.length < 2) {
        this.waMessage.contacts.contacts.push({ vcard });
        return;
      }

      this.waMessage.contacts.contacts.push({
        displayName: "",
        vcard,
      });
    }

    delete this.waMessage.text;
  }

  /**
   * * Refatora uma mensagem de reação
   * @param message
   */
  public refactoryReactionMessage(message: ReactionMessage) {
    this.waMessage = {
      react: {
        key: {
          remoteJid: getID(message.chat.id),
          id: message.id || "",
          fromMe: message.fromMe || !!message.user.id ? message.user.id == this.bot.id : false,
          participant: isJidGroup(message.chat.id) ? getID(message.user.id || this.bot.id) : undefined,
          toJSON: () => this,
        },
        text: message.text,
      },
    };
  }

  /**
   * * Refatora uma mensagem de enquete
   * @param message
   */
  public refactoryPollMessage(message: PollMessage) {
    this.waMessage = {
      poll: {
        name: message.text,
        values: message.options.map((opt) => opt.name),
      },
    };
  }

  /**
   * * Refatora uma mensagem de botão
   * @param message
   */
  public refactoryButtonMessage(message: ButtonMessage) {
    this.waMessage.text = message.text;
    this.waMessage.footer = message.footer;
    this.waMessage.viewOnce = true;

    if (message.type == MessageType.TemplateButton) {
      this.waMessage.templateButtons = message.buttons.map((button) => {
        if (button.type == "reply") return { index: button.index, quickReplyButton: { displayText: button.text, id: button.content } };
        if (button.type == "call") return { index: button.index, callButton: { displayText: button.text, phoneNumber: button.content } };
        if (button.type == "url") return { index: button.index, urlButton: { displayText: button.text, url: button.content } };
      });
    } else {
      this.waMessage.buttons = message.buttons.map((button) => {
        return { buttonId: button.content, buttonText: { displayText: button.text }, type: 1 };
      });
    }
  }

  /**
   * * Refatora uma mensagem de lista
   * @param message
   */
  public refactoryListMessage(message: ListMessage) {
    this.waMessage.buttonText = message.button;
    this.waMessage.description = message.text;
    this.waMessage.footer = message.footer;
    this.waMessage.title = message.title;
    this.waMessage.viewOnce = true;

    this.waMessage.sections = message.list.map((list: List) => {
      return {
        title: list.title,
        rows: list.items.map((item: ListItem) => {
          return { title: item.title, description: item.description, rowId: item.id };
        }),
      };
    });
  }
}
