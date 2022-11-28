import { ButtonMessage } from "@models/ButtonMessage";
import { WhatsAppBot } from "@services/WhatsAppBot";
import { ImageMessage } from "@models/ImageMessage";
import { ListMessage } from "@models/ListMessage";
import { List, ListItem } from "../types/List";
import { Message } from "@models/Message";

export class WhatsAppMessage {
  private _message: Message;
  private _wa: WhatsAppBot;

  public chat: string = "";
  public message: any = {};
  public context: any = {};

  constructor(wa: WhatsAppBot, message: Message | ButtonMessage) {
    this._wa = wa;
    this._message = message;
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

    if (message instanceof ImageMessage) await this.refactoryImageMessage(message);
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
   * * Refatora uma mensagem com imagem
   * @param message
   */
  public async refactoryImageMessage(message: ImageMessage) {
    this.message.caption = this.message.text;
    delete this.message.text;

    this.message.image = await message.getImage();
  }

  /**
   * * Refatora uma mensagem de botão
   * @param message
   */
  public async refactoryButtonMessage(message: ButtonMessage) {
    this.message.templateButtons = message.buttons;
    this.message.footer = message.footer;
    this.message.text = message.text;

    const image = await message.getImage();

    if (image) this.message.image = { url: image };

    message.buttons.forEach((button) => {
      const btn: any = {};
      btn.index = button.index;

      if (button.reply) btn.quickReplyButton = { displayText: button.reply.text, id: button.reply.id };
      if (button.call) btn.callButton = { displayText: button.call.text, phoneNumber: button.call.phone };
      if (button.url) btn.urlButton = { displayText: button.url.text, phoneNumber: button.url.url };

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
