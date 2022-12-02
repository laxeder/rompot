import {
  downloadMediaMessage,
  getContentType,
  MessageUpsertType,
  proto,
  WAMessage,
  WAMessageContent,
} from "@adiwajshing/baileys";

import { LocationMessage } from "@messages/LocationMessage";
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

export class WhatsAppConvertMessage {
  private _type?: MessageUpsertType;
  private _message: any = {};

  private _convertedMessage: Message = new Message(new Chat(""), "");
  private _user: User = new User("");
  private _chat: Chat = new Chat("");
  private _mention?: Message;

  constructor(message: WAMessage, type?: MessageUpsertType) {
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
  public get() {
    this.convertMessage(this._message, this._type);

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
  public convertMessage(message: WAMessage, type?: MessageUpsertType) {
    if (message.key.remoteJid) this._chat.setId(message.key.remoteJid);
    if (message.pushName) this._chat.name = message.pushName;

    this._user = new User(
      message.key.participant || message.participant || message.key.remoteJid || "",
      message.pushName as string
    );

    this.convertContentMessage(message.message);

    if (message.key.fromMe) this._convertedMessage.fromMe = message.key.fromMe;
    if (message.key.id) this._convertedMessage.id = message.key.id;
    if (type) this._convertedMessage.isOld = type !== "notify";

    this._convertedMessage.setOriginalMessage(message);
  }

  /**
   * * Converte o conteudo da mensagem
   * @param messageContent
   * @returns
   */
  public convertContentMessage(messageContent: WAMessageContent | undefined | null) {
    if (!!!messageContent) return;

    if (Object.keys(messageContent).includes("senderKeyDistributionMessage")) {
      this._chat.setIsOld(true);
    }

    const contentType = getContentType(messageContent);

    if (!contentType) return;

    let content: any =
      contentType === "conversation" ? { text: messageContent[contentType] } : messageContent[contentType];

    if (content.message) {
      this.convertContentMessage(content.message);
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
      this.convertContextMessage(content.contextInfo);
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
  public convertContextMessage(context: proto.ContextInfo) {
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

      const wa = new WhatsAppConvertMessage(message);

      this._mention = wa.get();

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
}
