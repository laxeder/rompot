import { generateWAMessage, generateWAMessageContent, generateWAMessageFromContent, isJidGroup, MiscMessageGenerationOptions, proto } from "@whiskeysockets/baileys";

import Message, { MessageStatus, MessageType } from "../messages/Message";
import ListMessage, { List, ListItem } from "../messages/ListMessage";
import LocationMessage from "../messages/LocationMessage";
import ReactionMessage from "../messages/ReactionMessage";
import ContactMessage from "../messages/ContactMessage";
import StickerMessage from "../messages/StickerMessage";
import ButtonMessage from "../messages/ButtonMessage";
import MediaMessage from "../messages/MediaMessage";
import ImageMessage from "../messages/ImageMessage";
import AudioMessage from "../messages/AudioMessage";
import VideoMessage from "../messages/VideoMessage";
import PollMessage from "../messages/PollMessage";
import CustomMessage  from "../messages/CustomMessage";

import { getWaSticker } from "../utils/Libs";

import { fixID, getID, getPhoneNumber } from "./ID";
import WhatsAppBot from "./WhatsAppBot";

export default class ConvertToWAMessage {
  public message: Message;
  public bot: WhatsAppBot;
  public isMention: boolean;

  public chatId: string = "";
  public waMessage: any = {};
  public options: MiscMessageGenerationOptions = {};
  public isRelay: boolean = false;

  constructor(bot: WhatsAppBot, message: Message, isMention: boolean = false) {
    this.message = message;
    this.bot = bot;
    this.isMention = !!isMention;
  }

  /**
   * * Refatora a mensagem
   * @param message
   */
  public async refactory(message = this.message): Promise<this> {
    this.waMessage = await this.refactoryMessage(message);
    this.chatId = message.chat.id;

    if (message.mention && !this.isMention) {
      const { chatId, waMessage } = await new ConvertToWAMessage(this.bot, message.mention, true).refactory(message.mention);

      const userJid = !!message.mention.user.id ? message.mention.user.id : fixID(this.bot.id);

      this.options.quoted = await generateWAMessage(chatId || this.chatId, waMessage, {
        userJid,
        upload(): any {
          return {};
        },
      });

      this.options.quoted.key.fromMe = userJid == this.bot.id;
      this.options.quoted.key.id = message.mention.id || this.options.quoted.key.id;

      if (this.chatId.includes("@g")) {
        this.options.quoted.key.participant = userJid;
      }
    }

    if (MediaMessage.isValid(message)) await this.refactoryMediaMessage(message);
    if (LocationMessage.isValid(message)) this.refactoryLocationMessage(message);
    if (ReactionMessage.isValid(message)) this.refactoryReactionMessage(message);
    if (ContactMessage.isValid(message)) this.refactoryContactMessage(message);
    if (ButtonMessage.isValid(message)) this.refactoryButtonMessage(message);
    if (ListMessage.isValid(message)) await this.refactoryListMessage(message);
    if (PollMessage.isValid(message)) this.refactoryPollMessage(message);
    if (CustomMessage.isValid(message)) this.refactoryCustomMessage(message);

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
      msg.participant = message.user.id;
    }

    if (message.mentions) {
      msg.mentions = [];

      for (const jid of message.mentions) {
        msg.mentions.push(jid);
      }

      for (const mention of msg.text.split(/@(.*?)/)) {
        const mentionNumber = `${getPhoneNumber(mention.split(/\s+/)[0])}`;

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
        remoteJid: message.chat.id || "",
        id: message.id || "",
        fromMe: message.fromMe || message.user.id == this.bot.id,
        participant: isJidGroup(message.chat.id) ? message.user.id || this.bot.id : undefined,
        toJSON: () => this,
      };
    }

    if (message.extra?.isRelay) {
      this.isRelay = true;
    }

    return msg;
  }

  /**
   * * Refatora uma mensagem de midia
   * @param message
   */
  public async refactoryMediaMessage(message: MediaMessage) {
    const stream = await message.getStream();

    // Convert audio message
    if (AudioMessage.isValid(message)) {
      this.waMessage.audio = stream;
      this.waMessage.ptt = !!message.isPTT;

      // Convert image message
    } else if (ImageMessage.isValid(message)) {
      this.waMessage.image = stream;

      // Convert video message
    } else if (VideoMessage.isValid(message)) {
      this.waMessage.video = stream;

      // Convert sticker message
    } else if (StickerMessage.isValid(message)) {
      await this.refatoryStickerMessage(message);

      // Convert default media message (includes file)
    } else {
      this.waMessage.document = stream;
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
      const waSticker = await getWaSticker();

      if (waSticker) {
        const sticker = new waSticker.default(stickerFile, {
          pack: message.pack,
          author: message.author,
          categories: message.categories,
          id: message.stickerId,
          type: waSticker.StickerTypes.FULL,
          quality: 100,
        });

        this.waMessage = { ...this.waMessage, ...(await sticker.toMessage()) };
      }
    } catch (err) {
      this.bot.emit("error", err);
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
      const vcard = "BEGIN:VCARD\n" + "VERSION:3.0\n" + `FN:${""}\n` + (user.description ? `ORG:${user.description};\n` : "") + `TEL;type=CELL;type=VOICE;waid=${user.id}: ${user.id}\n` + "END:VCARD";

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
          remoteJid: message.chat.id,
          id: message.id || "",
          fromMe: message.fromMe || !message.user.id ? true : message.user.id == this.bot.id,
          participant: isJidGroup(message.chat.id) ? message.user.id || this.bot.id : undefined,
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
  public async refactoryListMessage(message: ListMessage) {
    if (message.interactiveMode) {
      this.isRelay = true;

      const listMessage = {
        name: "single_select",
        buttonParamsJson: JSON.stringify({
          title: message.button,
          sections: message.list.map((list: List) => {
            return {
              title: list.title,
              ...(list.label ? { label: list.label } : {}),
              rows: list.items.map((item) => {
                return {
                  header: item.header ? item.header : item.title,
                  title: item.header ? item.title : "",
                  description: item.description,
                  id: item.id,
                };
              }),
            };
          }),
        }),
      };

      const waMessage = generateWAMessageFromContent(
        this.chatId,
        {
          viewOnceMessage: {
            message: {
              messageContextInfo: {
                deviceListMetadata: {},
                deviceListMetadataVersion: 2,
              },
              interactiveMessage: {
                body: {
                  text: message.text,
                },
                footer: {
                  text: message.footer,
                },
                header: {
                  title: message.title,
                  subtitle: message.subtitle,
                  hasMediaAttachment: false,
                },
                nativeFlowMessage: {
                  buttons: [listMessage],
                },
              },
            },
          },
        },
        { userJid: this.bot.id }
      );

      this.waMessage = waMessage.message;

      return;
    }

    this.waMessage.buttonText = message.button;
    this.waMessage.description = message.text;
    this.waMessage.footer = message.footer;
    this.waMessage.title = message.title;
    this.waMessage.listType = message.listType;
    this.waMessage.viewOnce = false;
    this.isRelay = true;

    this.waMessage.sections = message.list.map((list: List) => {
      return {
        title: list.title,
        rows: list.items.map((item: ListItem) => {
          return {
            title: item.title,
            description: item.description,
            rowId: item.id,
          };
        }),
      };
    });

    if (this.isRelay) {
      this.waMessage = await generateWAMessageContent(this.waMessage, { upload: () => ({} as any) });

      if (this.waMessage?.viewOnceMessage?.message?.listMessage) {
        this.waMessage.viewOnceMessage.message.listMessage.listType = message.listType;
      }

      if (this.waMessage?.listMessage) {
        this.waMessage.listMessage.listType = message.listType;
      }
    }
  }

  /**
   * * Refatora uma mensagem de lista
   * @param message
   */
  public async refactoryCustomMessage(message: CustomMessage) {
    delete this.waMessage["text"];
    
    Object.assign(this.waMessage, message.content);
  }

  public static convertToWaMessageStatus(status: MessageStatus): proto.WebMessageInfo.Status {
    if (status == MessageStatus.Error) return proto.WebMessageInfo.Status.ERROR;
    if (status == MessageStatus.Sending) return proto.WebMessageInfo.Status.PENDING;
    if (status == MessageStatus.Sended) return proto.WebMessageInfo.Status.SERVER_ACK;
    if (status == MessageStatus.Received) return proto.WebMessageInfo.Status.DELIVERY_ACK;
    if (status == MessageStatus.Readed) return proto.WebMessageInfo.Status.READ;
    if (status == MessageStatus.Played) return proto.WebMessageInfo.Status.PLAYED;

    return proto.WebMessageInfo.Status.PENDING;
  }
}
