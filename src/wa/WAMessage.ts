import { generateWAMessage, MiscMessageGenerationOptions } from "@adiwajshing/baileys";

import LocationMessage from "@messages/LocationMessage";
import ContactMessage from "@messages/ContactMessage";
import ButtonMessage from "@messages/ButtonMessage";
import ImageMessage from "@messages/ImageMessage";
import MediaMessage from "@messages/MediaMessage";
import VideoMessage from "@messages/VideoMessage";
import AudioMessage from "@messages/AudioMessage";
import FileMessage from "@messages/FileMessage";
import ListMessage from "@messages/ListMessage";
import Message from "@messages/Message";

import WhatsAppBot from "@wa/WhatsAppBot";
import { getID } from "@wa/ID";

import { List, ListItem } from "../types/Message";

export class WhatsAppMessage {
  private _message: Message;
  private _wa: WhatsAppBot;

  public chat: string = "";
  public message: any = {};
  public options: MiscMessageGenerationOptions = {};

  constructor(wa: WhatsAppBot, message: Message) {
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

      this.options.quoted = await generateWAMessage(this.chat, waMSG.message, {
        userJid: getID(waMSG.message.participant || this._wa.id),
        upload(): any {
          return {};
        },
      });
      this.options.quoted.key.fromMe = getID(waMSG.message.participant) == getID(this._wa.id);
    }

    if (message instanceof ButtonMessage) await this.refactoryButtonMessage(message);
    if (message instanceof MediaMessage) await this.refactoryMediaMessage(message);
    if (message instanceof LocationMessage) this.refactoryLocationMessage(message);
    if (message instanceof ContactMessage) this.refactoryContactMessage(message);
    if (message instanceof ListMessage) this.refactoryListMessage(message);
  }

  /**
   * * Refatora outras informações da mensagem
   * @param message
   * @returns
   */
  public async refactoryMessage(message: Message) {
    const msg: any = {};

    msg.text = message.text;
    msg.participant = getID(message.user.id);

    if (message.mentions) {
      msg.mentions = [];

      message.mentions.forEach((jid) => {
        msg.mentions.push(getID(jid));
      });
    }

    if (message.fromMe) msg.fromMe = message.fromMe;
    if (message.id) msg.id = message.id;

    return msg;
  }

  /**
   * * Refatora uma mensagem de midia
   * @param message
   */
  public async refactoryMediaMessage(message: MediaMessage) {
    this.message.caption = this.message.text;
    delete this.message.text;

    if (message instanceof ImageMessage) {
      this.message.image = await message.getImage();
    }

    if (message instanceof VideoMessage) {
      this.message.video = await message.getVideo();
    }

    if (message instanceof AudioMessage) {
      this.message.audio = await message.getAudio();
      this.message.mimetype = "audio/mp4";
    }

    if (message instanceof FileMessage) {
      this.message.document = await message.getFile();
      this.message.mimetype = "application/octet-stream";
    }

    if (message.isGIF) {
      this.message.gifPlayback = true;
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
      const vcard = "BEGIN:VCARD\n" + "VERSION:3.0\n" + `FN:${""}\n` + `ORG:${user.description};\n` + `TEL;type=CELL;type=VOICE;waid=${user.id}: ${getID(user.id)}\n` + "END:VCARD";

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
   * * Refatora uma mensagem de botão
   * @param message
   */
  public async refactoryButtonMessage(message: ButtonMessage) {
    this.message.footer = message.footer;
    this.message.templateButtons = [];
    this.message.text = message.text;

    message.buttons.forEach((button) => {
      const btn: any = {};
      btn.index = button.index;

      if (button.type == "reply") btn.quickReplyButton = { displayText: button.text, id: button.content };
      if (button.type == "call") btn.callButton = { displayText: button.text, phoneNumber: button.content };
      if (button.type == "reply") btn.urlButton = { displayText: button.text, url: button.content };

      this.message.templateButtons.push(btn);
    });
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
    this.message.sections = [];

    message.list.map((list: List) => {
      const rows: Array<any> = [];

      list.items.map((item: ListItem) => {
        rows.push({ title: item.title, description: item.description, rowId: item.id });
      });

      this.message.sections.push({ title: list.title, rows });
    });
  }
}
