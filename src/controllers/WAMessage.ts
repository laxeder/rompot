import { ButtonMessage } from "@models/ButtonMessage";
import { WhatsAppBot } from "@services/WhatsAppBot";
import { ListMessage } from "@models/ListMessage";
import { List, ListItem } from "../types/List";
import { Message } from "@models/Message";
import { MediaMessage } from "@models/MediaMessage";

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
    this.chat = message.chat.id;
    this.message = await this.refactoryMessage(message);

    if (message.mention) {
      const original = message.getOriginalMention();
      if (original) this.context.quoted = original;
      else this.context.quoted = this._wa.store.messages[message.mention.chat.id]?.get(message.mention.id);
    }

    if (message instanceof MediaMessage) await this.refactoryMediaMessage(message);
    if (message instanceof ButtonMessage) await this.refactoryButtonMessage(message);
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
    msg.participant = message.user.id;

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
}
