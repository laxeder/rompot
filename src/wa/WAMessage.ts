import { generateWAMessage, isJidGroup, MiscMessageGenerationOptions } from "@whiskeysockets/baileys";
import Sticker, { StickerTypes } from "@laxeder/wa-sticker/dist";

import { MessageType } from "@enums/Message";

import { IMediaMessage, IMessage, List, ListItem } from "@interfaces/IMessage";

import { StickerMessage, LocationMessage, ContactMessage, ButtonMessage, ListMessage, PollMessage, ReactionMessage } from "@messages/index";

import WhatsAppBot from "@wa/WhatsAppBot";
import { WAUser } from "@wa/WAModules";
import { getID } from "@wa/ID";
import {
  isAudioMessage,
  isButtonMessage,
  isContactMessage,
  isFileMessage,
  isImageMessage,
  isListMessage,
  isLocationMessage,
  isMediaMessage,
  isPollMessage,
  isReactionMessage,
  isStickerMessage,
  isVideoMessage,
} from "@utils/Message";

export class WhatsAppMessage {
  private _message: IMessage;
  private _wa: WhatsAppBot;

  public chat: string = "";
  public message: any = {};
  public options: MiscMessageGenerationOptions = {};
  public isRelay: boolean = false;

  constructor(wa: WhatsAppBot, message: IMessage) {
    this._message = message;
    this._wa = wa;
  }

  /**
   * * Refatora a mensagem
   * @param message
   */
  public async refactory(message = this._message) {
    this.chat = getID(message.chat.id);
    this.message = await this.refactoryMessage(message);

    if (message.mention) {
      const waMSG = new WhatsAppMessage(this._wa, message.mention);
      await waMSG.refactory(message.mention);

      const userJid = getID(!!message.mention.user.id ? message.mention.user.id : this._wa.id);

      this.options.quoted = await generateWAMessage(this.chat, waMSG.message, {
        userJid,
        upload(): any {
          return {};
        },
      });

      this.options.quoted.key.fromMe = userJid == getID(this._wa.id);

      if (this.chat.includes("@g")) {
        this.options.quoted.key.participant = userJid;
      }
    }

    if (isMediaMessage(message)) await this.refactoryMediaMessage(message);
    if (isLocationMessage(message)) this.refactoryLocationMessage(message);
    if (isReactionMessage(message)) this.refactoryReactionMessage(message);
    if (isContactMessage(message)) this.refactoryContactMessage(message);
    if (isButtonMessage(message)) this.refactoryButtonMessage(message);
    if (isListMessage(message)) this.refactoryListMessage(message);
    if (isPollMessage(message)) this.refactoryPollMessage(message);
  }

  /**
   * * Refatora outras informações da mensagem
   * @param message
   * @returns
   */
  public async refactoryMessage(message: IMessage) {
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

    return msg;
  }

  /**
   * * Refatora uma mensagem de midia
   * @param message
   */
  public async refactoryMediaMessage(message: IMediaMessage) {
    const stream = await message.getStream();

    if (isImageMessage(message)) {
      this.message.image = stream;
    }

    if (isVideoMessage(message)) {
      this.message.video = stream;
    }

    if (isAudioMessage(message)) {
      this.message.audio = stream;
    }

    if (isFileMessage(message)) {
      this.message.file = stream;
    }

    if (isStickerMessage(message)) {
      await this.refatoryStickerMessage(message);
    }

    if (message.isGIF) {
      this.message.gifPlayback = true;
    }

    this.message.caption = this.message.text;
    this.message.mimetype = message.mimetype;
    this.message.fileName = message.name;

    delete this.message.text;
  }

  public async refatoryStickerMessage(message: StickerMessage) {
    const stickerFile = await message.getSticker();

    this.message = { ...this.message, sticker: stickerFile };

    try {
      const sticker = new Sticker(stickerFile, {
        pack: message.pack,
        author: message.author,
        categories: message.categories,
        id: message.stickerId,
        type: StickerTypes.FULL,
        quality: 100,
      });

      this.message = { ...this.message, ...(await sticker.toMessage()) };
    } catch (err) {
      this._wa.ev.emit("error", err);
    }
  }

  public refactoryLocationMessage(message: LocationMessage) {
    this.message.location = { degreesLatitude: message.latitude, degreesLongitude: message.longitude };

    delete this.message.text;
  }

  public refactoryContactMessage(message: ContactMessage) {
    this.message.contacts = {
      displayName: message.text,
      contacts: [],
    };

    message.contacts.forEach((user) => {
      const vcard =
        "BEGIN:VCARD\n" + "VERSION:3.0\n" + `FN:${""}\n` + (user instanceof WAUser ? `ORG:${user.description};\n` : "") + `TEL;type=CELL;type=VOICE;waid=${user.id}: ${getID(user.id)}\n` + "END:VCARD";

      if (message.contacts.length < 2) {
        this.message.contacts.contacts.push({ vcard });
        return;
      }

      this.message.contacts.contacts.push({
        displayName: "",
        vcard,
      });
    });

    delete this.message.text;
  }

  /**
   * * Refatora uma mensagem de reação
   * @param message
   */
  public refactoryReactionMessage(message: ReactionMessage) {
    this.message = {
      react: {
        key: {
          remoteJid: getID(message.chat.id),
          id: message.id || "",
          fromMe: message.fromMe || !!message.user.id ? message.user.id == this._wa.id : false,
          participant: message.chat.id.includes("@g") ? getID(message.user.id || this._wa.id) : undefined,
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
    this.message = {
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
    this.message.text = message.text;
    this.message.footer = message.footer;
    this.message.viewOnce = true;

    if (message.type == MessageType.TemplateButton) {
      this.message.templateButtons = message.buttons.map((button) => {
        if (button.type == "reply") return { index: button.index, quickReplyButton: { displayText: button.text, id: button.content } };
        if (button.type == "call") return { index: button.index, callButton: { displayText: button.text, phoneNumber: button.content } };
        if (button.type == "url") return { index: button.index, urlButton: { displayText: button.text, url: button.content } };
      });
    } else {
      this.message.buttons = message.buttons.map((button) => {
        return { buttonId: button.content, buttonText: { displayText: button.text }, type: 1 };
      });
    }
  }

  /**
   * * Refatora uma mensagem de lista
   * @param message
   */
  public refactoryListMessage(message: ListMessage) {
    this.message.buttonText = message.button;
    this.message.description = message.text;
    this.message.footer = message.footer;
    this.message.title = message.title;
    this.message.viewOnce = true;

    this.message.sections = message.list.map((list: List) => {
      return {
        title: list.title,
        rows: list.items.map((item: ListItem) => {
          return { title: item.title, description: item.description, rowId: item.id };
        }),
      };
    });
  }
}
