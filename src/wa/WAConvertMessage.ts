import { downloadMediaMessage, getContentType, MessageUpsertType, proto, WAMessage, WAMessageContent } from "@adiwajshing/baileys";
import pino from "pino";

import LocationMessage from "@messages/LocationMessage";
import ContactMessage from "@messages/ContactMessage";
import ButtonMessage from "@messages/ButtonMessage";
import ImageMessage from "@messages/ImageMessage";
import MediaMessage from "@messages/MediaMessage";
import VideoMessage from "@messages/VideoMessage";
// import AudioMessage from "@messages/AudioMessage";
import ListMessage from "@messages/ListMessage";

import WhatsAppBot from "@wa/WhatsAppBot";
import { Message } from "@messages/Message";
import { replaceID } from "@wa/ID";
import { Chat } from "@modules/Chat";
import { User } from "@modules/User";
import AudioMessage from "@messages/AudioMessage";

export class WhatsAppConvertMessage {
  private _type?: MessageUpsertType;
  private _message: any = {};

  private _convertedMessage: IMessage = Message(Chat(""), "");
  private _user: User = User("");
  private _chat: Chat = Chat("");
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

    if (this._mention) this._convertedMessage.mention = this._mention;

    this._convertedMessage.chat = this._chat;
    this._convertedMessage.user = this._user;

    return this._convertedMessage;
  }

  /**
   * * Converte a mensagem
   * @param message
   * @param type
   */
  public async convertMessage(message: WAMessage, type?: MessageUpsertType) {
    const id = replaceID(message.key.remoteJid || "");

    const chat = this._wa.chats[id] ? this._wa.chats[id] : Chat(id);

    if (id) {
      if (chat) this._chat = chat;

      this._chat.id = id;
    }

    if (chat?.id.includes("@g")) this._chat.type = "group";
    if (chat?.id.includes("@s")) this._chat.type = "pv";

    if (message.pushName) this._chat.name = message.pushName;

    const userID = replaceID(message.key.participant || message.participant || message.key.remoteJid || "");
    this._user = chat?.users && chat?.users[userID] ? chat?.users[userID] : User(userID);
    this._user.name = message.pushName || "";

    await this.convertContentMessage(message.message);

    if (message.key.fromMe) {
      this._convertedMessage.fromMe = message.key.fromMe;
      this._user.id = replaceID(this._wa.id);
    }

    if (message.messageTimestamp) this._convertedMessage.timestamp = message.messageTimestamp;
    if (message.key.id) this._convertedMessage.id = message.key.id;
    // if (type) this._convertedMessage.isOld = type !== "notify";
  }

  /**
   * * Converte o conteudo da mensagem
   * @param messageContent
   * @returns
   */
  public async convertContentMessage(messageContent: WAMessageContent | undefined | null) {
    if (!!!messageContent) return;

    const contentType = getContentType(messageContent);

    if (!contentType) return;

    let content: any = contentType === "conversation" ? { text: messageContent[contentType] } : messageContent[contentType];

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

    if (!!!this._convertedMessage.text) {
      this._convertedMessage.text = content.text || content.caption || content.buttonText || content.contentText || content.hydratedTemplate?.hydratedContentText || content.displayName || "";
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
    if (context.mentionedJid) {
      for (const jid of context.mentionedJid) {
        this._convertedMessage.mentions.push(replaceID(jid));
      }
    }

    if (context.quotedMessage) {
      const message = {
        key: {
          remoteJid: replaceID(this._chat.id),
          participant: replaceID(context.participant),
          id: context.stanzaId,
        },
        message: context.quotedMessage,
      };

      const wa = new WhatsAppConvertMessage(this._wa, message);

      this._mention = await wa.get();
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

    const getContact = (vcard: string | any): string => {
      //TODO: obter diretamente contato

      const user = User("");

      if (typeof vcard == "object") {
        vcard = vcard.vcard;
      }

      const name = vcard.slice(vcard.indexOf("FN:"));
      user.name = name.slice(3, name.indexOf("\n"));

      const id = vcard.slice(vcard.indexOf("waid=") + 5);
      user.id = replaceID(id.slice(0, id.indexOf(":")) + "@s.whatsapp.net");

      return user.id;
    };

    const contacts: string[] = [];

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
      this._convertedMessage = new AudioMessage(this._chat, content.url);
    }

    if (content.gifPlayback && this._convertedMessage instanceof MediaMessage) {
      this._convertedMessage.isGIF = true;
    }

    const logger: any = pino({ level: "silent" });

    if (this._convertedMessage instanceof MediaMessage) {
      const download = () => {
        return downloadMediaMessage(
          this._message,
          "buffer",
          {},
          {
            logger,
            reuploadRequest: (msg: proto.IWebMessageInfo) => new Promise((resolve) => resolve(msg)),
          }
        );
      };

      Object.defineProperty(this._convertedMessage, "getStream", {
        get: () => download,
      });
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

    buttonMSG.text = buttonMessage.contentText || buttonMessage.hydratedContentText || "";
    buttonMSG.footer = buttonMessage.footerText || buttonMessage.hydratedFooterText || "";
    // buttonMSG.setType(buttonMessage.headerType || buttonMessage.hydratedHeaderType || 1)

    buttonMessage.buttons?.map((button: proto.Message.ButtonsMessage.IButton) => {
      buttonMSG.addReply(button?.buttonText?.displayText || "", button.buttonId || buttonMSG.generateID());
    });

    buttonMessage.hydratedButtons?.map((button: any) => {
      if (button.callButton) {
        buttonMSG.addCall(button.callButton.displayText || "", button.callButton.phoneNumber || buttonMSG.buttons.length);
      }

      if (button.urlButton) {
        buttonMSG.addUrl(button.urlButton.displayText || "", button.urlButton.url || "");
      }

      if (button.quickReplyButton) {
        buttonMSG.addReply(button.quickReplyButton.displayText || "", button.quickReplyButton.id);
      }
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

    listMSG.text = listMessage.description || "";
    listMSG.title = listMessage.title || "";
    listMSG.footer = listMessage.footerText || "";
    listMSG.button = listMessage.buttonText || "";

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
