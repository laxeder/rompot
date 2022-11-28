import {
  downloadMediaMessage,
  getContentType,
  MessageUpsertType,
  proto,
  WAMessage,
  WAMessageContent,
} from "@adiwajshing/baileys";

import { ButtonMessage } from "@models/ButtonMessage";
import { ImageMessage } from "@models/ImageMessage";
import { MediaMessage } from "@models/MediaMessage";
import { ListMessage } from "@models/ListMessage";
import { loggerConfig } from "@config/logger";
import { Message } from "@models/Message";
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
      this.convertMediaMessage(messageContent, contentType);
    }

    if (contentType === "buttonsMessage" || contentType === "templateMessage") {
      this.convertButtonMessage(messageContent);
    }

    if (contentType === "listMessage") {
      this.convertListMessage(messageContent);
    }

    if (!!!this._convertedMessage.text) {
      this._convertedMessage.setText(
        content.text ||
          content.caption ||
          content.buttonText ||
          content.contentText ||
          content.hydratedTemplate?.hydratedContentText ||
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
   * * Converte mensagem de midia
   * @param content
   * @param contentType
   */
  public convertMediaMessage(content: any, contentType: keyof proto.IMessage) {
    if (contentType == "imageMessage") {
      this._convertedMessage = new ImageMessage(this._chat, this._convertedMessage.text, content.url);
    }

    const log: any = loggerConfig({ level: "silent" });

    if (this._convertedMessage instanceof MediaMessage) {
      const download = () =>
        downloadMediaMessage(
          this._message,
          "buffer",
          {},
          {
            logger: log,
            reuploadRequest: (msg: proto.IWebMessageInfo) => new Promise((resolve) => resolve(msg)),
          }
        );

      this._convertedMessage.setSream(download);
    }

    //TODO: ler outras media message
    // if (contentType == "videoMessage" || contentType == "audioMessage")
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
