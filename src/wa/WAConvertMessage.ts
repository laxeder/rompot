import {
  downloadMediaMessage,
  getContentType,
  MessageUpsertType,
  proto,
  WAMessage,
  WAMessageContent,
} from "@adiwajshing/baileys";

import { LocationMessage } from "@messages/LocationMessage";
import { ReactionMessage } from "@messages/ReactionMessage";
import { ContactMessage } from "@messages/ContactMessage";
import { ButtonMessage } from "@messages/ButtonMessage";
import { ImageMessage } from "@messages/ImageMessage";
import { MediaMessage } from "@messages/MediaMessage";
import { VideoMessage } from "@messages/VideoMessage";
import { AudioMessage } from "@messages/AudioMessage";
import { ListMessage } from "@messages/ListMessage";

import { loggerConfig } from "@config/logger";
import { Message } from "@messages/Message";
import { Chat } from "@models/Chat";
import { User } from "@models/User";
import { WhatsAppBot } from "./WhatsAppBot";

export class WhatsAppConvertMessage {
  private _type?: MessageUpsertType;
  private _message: any = {};

  private _convertedMessage: Message = new Message(new Chat(""), "");
  private _user: User = new User("");
  private _chat: Chat = new Chat("");
  private _mention?: Message;
  private _wa: WhatsAppBot;

  constructor(wa: WhatsAppBot, message: WAMessage, type?: MessageUpsertType) {
    this._wa = wa;
    this.set(message, type);
  }

  /**
   * * Define a mensagem a ser convertida
   * @param message
   * @param type
   */
  public set(message: WAMessage = this._message, type?: MessageUpsertType) {
    this._message = message;
    this._type = type;
  }

  /**
   * * Retorna a mensagem convertida
   */
  public async get() {
    await this.convertMessage(this._message, this._type);

    if (this._mention) this._convertedMessage.setMention(this._mention);

    this._convertedMessage.setChat(this._chat);
    this._convertedMessage.setUser(this._user);

    return this._convertedMessage;
  }

  /**
   * * Converte a mensagem
   * @param message
   * @param type
   */
  public async convertMessage(message: WAMessage, type?: MessageUpsertType) {
    const chat = await this._wa.getChat(message.key.remoteJid || "");

    if (message.key.remoteJid) {
      if (chat) this._chat = chat;

      this._chat.setId(message.key.remoteJid);
    }

    if (chat?.id.includes("@g")) this._chat.setType("group");
    if (chat?.id.includes("@s")) this._chat.setType("pv");

    if (message.pushName) this._chat.name = message.pushName;

    const userID = message.key.participant || message.participant || message.key.remoteJid || "";
    this._user = chat?.members[userID] || new User(userID);
    this._user.setName(message.pushName as string);

    await this.convertContentMessage(message.message);

    if (message.key.fromMe) {
      this._convertedMessage.fromMe = message.key.fromMe;
      this._user.setId(this._wa.user.id);
    }

    if (message.key.id) this._convertedMessage.id = message.key.id;
    if (type) this._convertedMessage.isOld = type !== "notify";

    this._convertedMessage.setOriginalMessage(message);
  }

  /**
   * * Converte o conteudo da mensagem
   * @param messageContent
   * @returns
   */
  public async convertContentMessage(messageContent: WAMessageContent | undefined | null) {
    if (!!!messageContent) return;

    if (Object.keys(messageContent).includes("senderKeyDistributionMessage")) {
      this._chat.setIsOld(true);
    }

    const contentType = getContentType(messageContent);

    if (!contentType) return;

    let content: any =
      contentType === "conversation" ? { text: messageContent[contentType] } : messageContent[contentType];

    if (content.message) {
      await this.convertContentMessage(content.message);
      return;
    }

    if (contentType == "imageMessage" || contentType == "videoMessage" || contentType == "audioMessage") {
      this.convertMediaMessage(content, contentType);
    }

    if (contentType === "buttonsMessage" || contentType === "templateMessage") {
      this.convertButtonMessage(messageContent);
    }

    if (contentType === "listMessage") {
      this.convertListMessage(messageContent);
    }

    if (contentType === "locationMessage") {
      this.convertLocationMessage(content);
    }

    if (contentType === "contactMessage" || contentType == "contactsArrayMessage") {
      this.convertContactMessage(content);
    }

    if (contentType === "reactionMessage") {
      this.convertReactionMessage(content);
    }

    if (!!!this._convertedMessage.text) {
      this._convertedMessage.setText(
        content.text ||
          content.caption ||
          content.buttonText ||
          content.contentText ||
          content.hydratedTemplate?.hydratedContentText ||
          content.displayName ||
          ""
      );
    }

    if (content.contextInfo) {
      await this.convertContextMessage(content.contextInfo);
    }

    if (content.singleSelectReply?.selectedRowId) {
      this._convertedMessage.selected = content.singleSelectReply.selectedRowId;
    }

    if (content.selectedId) {
      this._convertedMessage.selected = content.selectedId;
    }
  }

  /**
   * * Converte o contexto da mensagem
   * @param context
   * @returns
   */
  public async convertContextMessage(context: proto.ContextInfo) {
    if (context.mentionedJid) this._convertedMessage.setMentions(context.mentionedJid);

    if (context.quotedMessage) {
      const message = {
        key: {
          remoteJid: this._chat.id,
          participant: context.participant,
          id: context.stanzaId,
        },
        message: context.quotedMessage,
      };

      const wa = new WhatsAppConvertMessage(this._wa, message);

      this._mention = await wa.get();

      this._convertedMessage.setOriginalMention(message);
    }
  }

  /**
   * * Converte mensagem de localização
   * @param content
   */
  public convertLocationMessage(content: any) {
    this._convertedMessage = new LocationMessage(this._chat, content.degreesLatitude, content.degreesLongitude);
  }

  /**
   * * Converte mensagem com contatos
   * @param content
   */
  public convertContactMessage(content: any) {
    this._convertedMessage = new ContactMessage(this._chat, content.displayName, []);

    const getContact = (vcard: string | any): User => {
      const user = new User("");

      if (typeof vcard == "object") {
        vcard = vcard.vcard;
      }

      const name = vcard.slice(vcard.indexOf("FN:"));
      user.setName(name.slice(3, name.indexOf("\n")));

      const id = vcard.slice(vcard.indexOf("waid=") + 5);
      user.setId(id.slice(0, id.indexOf(":")) + "@s.whatsapp.net");

      return user;
    };

    const contacts: User[] = [];

    if (content.contacts) {
      content.contacts.forEach((vcard: string) => {
        contacts.push(getContact(vcard));
      });
    }

    if (content.vcard) {
      contacts.push(getContact(content.vcard));
    }

    if (this._convertedMessage instanceof ContactMessage) {
      this._convertedMessage.contacts = contacts;
    }
  }

  /**
   * * Converte mensagem de midia
   * @param content
   * @param contentType
   */
  public convertMediaMessage(content: any, contentType: keyof proto.IMessage) {
    if (contentType == "imageMessage") {
      this._convertedMessage = new ImageMessage(this._chat, this._convertedMessage.text, content.url);
    }

    if (contentType == "videoMessage") {
      this._convertedMessage = new VideoMessage(this._chat, this._convertedMessage.text, content.url);
    }

    if (contentType == "audioMessage") {
      this._convertedMessage = new AudioMessage(this._chat, this._convertedMessage.text, content.url);
    }

    if (content.gifPlayback && this._convertedMessage instanceof MediaMessage) {
      this._convertedMessage.setIsGIF(true);
    }

    const logger: any = loggerConfig({ level: "silent" });

    if (this._convertedMessage instanceof MediaMessage) {
      const download = () =>
        downloadMediaMessage(
          this._message,
          "buffer",
          {},
          {
            logger,
            reuploadRequest: (msg: proto.IWebMessageInfo) => new Promise((resolve) => resolve(msg)),
          }
        );

      this._convertedMessage.setSream(download);
    }
  }

  /**
   * * Converte uma mensagem de botão
   * @param content
   * @returns
   */
  public convertButtonMessage(content: WAMessageContent) {
    let buttonMessage: any = content.buttonsMessage || content.templateMessage;
    const buttonMSG = new ButtonMessage(this._chat, "");

    if (buttonMessage.hydratedTemplate) buttonMessage = buttonMessage.hydratedTemplate;

    buttonMSG.setText(buttonMessage.contentText || buttonMessage.hydratedContentText || "");
    buttonMSG.setFooter(buttonMessage.footerText || buttonMessage.hydratedFooterText || "");
    buttonMSG.setType(buttonMessage.headerType || buttonMessage.hydratedHeaderType || 1);

    buttonMessage.buttons?.map((button: proto.Message.ButtonsMessage.IButton) => {
      buttonMSG.addReply(button?.buttonText?.displayText || "", button.buttonId || buttonMSG.generateID());
    });

    buttonMessage.hydratedButtons?.map((button: any) => {
      if (button.callButton)
        buttonMSG.addCall(
          button.callButton.displayText || "",
          button.callButton.phoneNumber || buttonMSG.buttons.length
        );
      if (button.urlButton) buttonMSG.addCall(button.urlButton.displayText || "", button.urlButton.url || "");
      if (button.quickReplyButton)
        buttonMSG.addCall(button.quickReplyButton.displayText || "", button.quickReplyButton.id);
    });

    this._convertedMessage = buttonMSG;
  }

  /**
   * * Converte uma mensagem de lista
   * @param content
   * @returns
   */
  public convertListMessage(content: WAMessageContent) {
    let listMessage = content.listMessage;

    if (!!!listMessage) return;

    const listMSG = new ListMessage(this._chat, "", "", "", "");

    listMSG.setText(listMessage.description || "");
    listMSG.title = listMessage.title || "";
    listMSG.footer = listMessage.footerText || "";
    listMSG.buttonText = listMessage.buttonText || "";

    listMessage?.sections?.map((list) => {
      const index = listMSG.list.length;
      listMSG.addCategory(list.title || "");

      list.rows?.map((item) => {
        listMSG.addItem(index, item.title || "", item.description || "", item.rowId || "");
      });
    });

    this._convertedMessage = listMSG;
  }

  public convertReactionMessage(content: any) {
    this._convertedMessage = new ReactionMessage(this._chat, content.text, content.key.id);
  }
}
