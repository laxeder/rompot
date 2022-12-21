import { LocationMessage } from "@messages/LocationMessage";
import { ReactionMessage } from "@messages/ReactionMessage";
import { ContactMessage } from "@messages/ContactMessage";
import { generateWAMessage } from "@adiwajshing/baileys";
import { ButtonMessage } from "@messages/ButtonMessage";
import { MediaMessage } from "@messages/MediaMessage";
import { ListMessage } from "@messages/ListMessage";
import { List, ListItem } from "../types/List";
import { WhatsAppBot } from "@wa/WhatsAppBot";
import { Message } from "@messages/Message";
import { getID } from "@wa/ID";

export class WhatsAppMessage {
  private _message: Message;
  private _wa: WhatsAppBot;

  public chat: string = "";
  public message: any = {};
  public context: any = {};

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
      const original = message.getOriginalMention();
      const ctx: any = {};

      this.context.quoted =
        original ||
        message.mention.getOriginalMessage() ||
        (await generateWAMessage(this.chat, this.message, {
          userJid: this._wa.id,
          logger: this._wa.config.logger,
          ...ctx,
        }));
    }

    if (message instanceof ButtonMessage) await this.refactoryButtonMessage(message);
    if (message instanceof MediaMessage) await this.refactoryMediaMessage(message);
    if (message instanceof LocationMessage) this.refactoryLocationMessage(message);
    if (message instanceof ContactMessage) this.refactoryContactMessage(message);
    if (message instanceof ListMessage) this.refactoryListMessage(message);
    if (message instanceof ReactionMessage) this.refactoryReactionMessage(message);
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

    if (message.mentions) msg.mentions = message.mentions;
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

    const image = await message.getImage();
    if (image) {
      this.message.image = image;
    }

    const video = await message.getVideo();
    if (video) {
      this.message.video = video;
    }

    const audio = await message.getAudio();
    if (audio) {
      this.message.audio = audio;
      this.message.mimetype = "audio/mp4";
    }

    if (message.isGIF) {
      this.message.gifPlayback = true;
    }
  }

  public refactoryLocationMessage(message: LocationMessage) {
    this.message.location = { degreesLatitude: message.getLatitude(), degreesLongitude: message.getLongitude() };

    delete this.message.text;
  }

  public refactoryContactMessage(message: ContactMessage) {
    this.message.contacts = {
      displayName: message.text,
      contacts: [],
    };

    message.contacts.forEach((user) => {
      const vcard =
        "BEGIN:VCARD\n" +
        "VERSION:3.0\n" +
        `FN:${user.name || ""}\n` +
        // `ORG:${user.description};\n` +
        `TEL;type=CELL;type=VOICE;waid=${user.id}: ${getID(user.id)}\n` +
        "END:VCARD";

      if (message.contacts.length < 2) {
        this.message.contacts.contacts.push({ vcard });
        return;
      }

      this.message.contacts.contacts.push({
        displayName: user.name,
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

      if (button.reply) btn.quickReplyButton = { displayText: button.reply.text, id: button.reply.id };
      if (button.call) btn.callButton = { displayText: button.call.text, phoneNumber: button.call.phone };
      if (button.url) btn.urlButton = { displayText: button.url.text, url: button.url.url };

      this.message.templateButtons.push(btn);
    });
  }

  /**
   * * Refatora uma mensagem de lista
   * @param message
   */
  public refactoryListMessage(message: ListMessage) {
    this.message.buttonText = message.buttonText;
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

  /**
   * * Refatora uma mensagem de reação
   * @param message
   */
  public refactoryReactionMessage(message: ReactionMessage) {
    const fromMe = message.fromMe || this._wa.id == message.user.id;

    this.message = {
      react: {
        text: message.text[0],
        key: { remoteJid: getID(message.chat.id), id: message.id, fromMe },
      },
    };

    if (message.chat.id.includes("@g")) {
      this.message.react.key.participant = getID(message.user.id || this._wa.id);
    }
  }
}
