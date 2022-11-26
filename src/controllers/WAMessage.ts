import { downloadMediaMessage } from "@adiwajshing/baileys";
import { Transform } from "stream";

import { ButtonMessage } from "@models/ButtonMessage";
import { WhatsAppBot } from "@services/WhatsAppBot";
import { ImageMessage } from "@models/ImageMessage";
import { ListMessage } from "@models/ListMessage";
import { List, ListItem } from "../types/List";
import { Message } from "@models/Message";
import { logger } from "../config/logger";

export class WhatsAppMessage {
  private _message: Message;
  private _wa: WhatsAppBot;

  public chat: string = "";
  public message: any = {};
  public context: any = {};
  public relay: boolean = false;

  constructor(wa: WhatsAppBot, message: Message | ButtonMessage) {
    this._wa = wa;
    this._message = message;
  }

  /**
   * * Refatora a mensagem
   * @param message
   */
  public async refactory(message = this._message, wa: WhatsAppBot) {
    this.chat = message.chat.id;
    this.message = await this.refactoryMessage(message);

    if (message.mention) {
      const original = message.getOriginalMention();
      if (original) this.context.quoted = original;
      else this.context.quoted = this._wa.store.messages[message.mention.chat.id]?.get(message.mention.id);
    }
    if (message instanceof ButtonMessage) this.refactoryButtonMessage(message);
    if (message instanceof ListMessage) this.refactoryListMessage(message);
    if (message instanceof ImageMessage) await this.refactoryImageMessage(message, wa);
  }
  public async refactoryMessage(message: Message) {
    const msg: any = {};

    msg.text = message.text;

    if (message.member) msg.participant = message.member;
    if (message.fromMe) msg.fromMe = message.fromMe;
    if (message.id) msg.id = message.id;
    if (message.mentions) msg.mentions = message.mentions;

    return msg;
  }

  public async refactoryImageMessage(message: ImageMessage, wa: WhatsAppBot) {
    this.message.caption = this.message.text;
    delete this.message.text;

    let imageUrl: Buffer | string | Transform = message.getImage();

    if (typeof imageUrl == "string") {
      imageUrl = await downloadMediaMessage(
        message._originalMessage,
        "buffer",
        {},
        {
          logger,
          reuploadRequest: wa.updateMediaMessage,
        }
      );
    }

    this.message.image = imageUrl;
  }

  /**
   * * Refatora uma mensagem de botão
   * @param message
   */
  public refactoryButtonMessage(message: ButtonMessage) {
    this.relay = true;

    const hydratedTemplate: any = {
      hydratedContentText: message.text,
      hydratedFooterText: message.footer,
      hydratedButtons: [],
    };

    message.buttons.map((button) => {
      const btn: any = {};
      btn.index = button.index;

      if (button.reply) btn.quickReplyButton = { displayText: button.reply.text, id: button.reply.id };
      if (button.call) btn.callButton = { displayText: button.call.text, phoneNumber: button.call.phone };
      if (button.url) btn.urlButton = { displayText: button.url.text, phoneNumber: button.url.url };

      hydratedTemplate.hydratedButtons.push(btn);
    });

    //? A API do WhatsApp está com problemas na mensagem de template
    //! TODO: Arrumar sistema de mensagem template
    this.message = {
      viewOnceMessage: {
        message: {
          templateMessage: {
            hydratedTemplate,
          },
        },
      },
    };
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
