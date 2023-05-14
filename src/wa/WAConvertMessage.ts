import type { Media, PollOption } from "../types/Message";

import { decryptPollVote, getContentType, MessageUpsertType, proto, WAMessage, WAMessageContent } from "@whiskeysockets/baileys";
import { extractMetadata } from "@laxeder/wa-sticker/dist";
import digestSync from "crypto-digest-sync";

import { MessageType } from "@enums/Message";

import { IMessage } from "@interfaces/IMessage";

import {
  AudioMessage,
  ButtonMessage,
  ContactMessage,
  EmptyMessage,
  FileMessage,
  ImageMessage,
  ListMessage,
  LocationMessage,
  MediaMessage,
  Message,
  PollMessage,
  PollUpdateMessage,
  ReactionMessage,
  StickerMessage,
  VideoMessage,
} from "@messages/index";

import Chat from "@modules/Chat";
import User from "@modules/User";

import { WAChat, WAUser } from "@wa/WAModules";
import WhatsAppBot from "@wa/WhatsAppBot";
import { getID, replaceID } from "@wa/ID";

import { isStickerMessage } from "@utils/Verify";

export class WhatsAppConvertMessage {
  private _type?: MessageUpsertType;
  private _message: any = {};

  private _convertedMessage: IMessage = new Message("", "");
  private _user: User = new User("");
  private _chat: Chat = new Chat("");
  private _mention?: IMessage;
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

    this._convertedMessage.chat = new Chat(this._chat.id, this._chat.type, this._chat.name);
    this._convertedMessage.user = new User(this._user.id, this._user.name);

    return this._convertedMessage;
  }

  /**
   * * Converte a mensagem
   * @param message
   * @param type
   */
  public async convertMessage(message: WAMessage, type?: MessageUpsertType) {
    if (!!!message) {
      this._convertedMessage = new EmptyMessage();

      return;
    }

    const id = replaceID(message?.key?.remoteJid || "");

    const chat = this._wa.chats[id] ? this._wa.chats[id] : new WAChat(id);

    if (id) {
      if (chat) this._chat = chat;

      this._chat.id = id;
    }

    if (chat?.id.includes("@g")) {
      this._chat.type = "group";
      this._chat.name = this._wa.chats[chat.id]?.name || "";
    }

    if (chat?.id.includes("@s") || !chat.id.includes("@")) {
      this._chat.type = "pv";

      if (!message.key.fromMe) {
        this._chat.name = message.pushName;

        //? O WhatsApp não envia o nome de um chat privado normalmente, então recolho ele da mensagem
        if (!this._wa.chats.hasOwnProperty(id) || (!!this._chat.name && this._wa.chats[id].name != this._chat.name)) {
          await this._wa.addChat(this._chat);
        }
      }
    }

    const userID = replaceID(message.key.fromMe ? this._wa.id : message.key.participant || message.participant || message.key.remoteJid || "");
    const user = this._wa.users[userID] || new WAUser(userID);

    if (!!message.pushName) user.name = message.pushName;

    //? O WhatsApp não envia o nome do usuário normalmente, então recolho ele da mensagem
    if (!this._wa.users.hasOwnProperty(userID) || (!!user.name && this._wa.users[userID].name != user.name)) {
      await this._wa.addUser(user);
    }

    this._user = user;

    await this.convertContentMessage(message.message);

    if (message.key.fromMe) {
      this._convertedMessage.fromMe = message.key.fromMe;
      this._user.id = replaceID(this._wa.id);
    }

    this._convertedMessage.apiSend = this._wa.sendedMessages.hasOwnProperty(message.key.id);

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
    if (!!!messageContent) {
      this._convertedMessage = new EmptyMessage();

      return;
    }

    const contentType = getContentType(messageContent);

    if (!contentType || (contentType == "protocolMessage" && !!messageContent[contentType]?.historySyncNotification)) {
      this._convertedMessage = new EmptyMessage();

      return;
    }

    let content: any = contentType === "conversation" ? { text: messageContent[contentType] } : messageContent[contentType];

    if (content.message) {
      await this.convertContentMessage(content.message);
      return;
    }

    if (contentType == "imageMessage" || contentType == "videoMessage" || contentType == "audioMessage" || contentType == "stickerMessage" || contentType == "documentMessage") {
      await this.convertMediaMessage(content, contentType);
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

    if (contentType === "pollCreationMessage") {
      this.convertPollCreationMessage(content);
    }

    if (contentType == "pollUpdateMessage") {
      await this.convertPollUpdateMessage(content);
    }

    if (!!!this._convertedMessage.text) {
      this._convertedMessage.text =
        content.text || content.caption || content.buttonText || content.hydratedTemplate?.hydratedContentText || content.displayName || content.contentText || this._convertedMessage.text || "";
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

    if (contentType == "protocolMessage") this._convertedMessage.isDeleted = true;
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
    const msg = new ContactMessage(this._chat, content.displayName, []);

    const getContact = (vcard: string | any): User => {
      const user = new WAUser("");

      if (typeof vcard == "object") {
        vcard = vcard.vcard;
      }

      const name = vcard.slice(vcard.indexOf("FN:"));
      user.name = name.slice(3, name.indexOf("\n"));

      const id = vcard.slice(vcard.indexOf("waid=") + 5);
      user.id = replaceID(id.slice(0, id.indexOf(":")) + "@s.whatsapp.net");

      return user;
    };

    if (content.contacts) {
      content.contacts.forEach((vcard: string) => {
        msg.contacts.push(getContact(vcard));
      });
    }

    if (content.vcard) {
      msg.contacts.push(getContact(content.vcard));
    }

    this._convertedMessage = msg;
  }

  /**
   * * Converte mensagem de midia
   * @param content
   * @param contentType
   */
  public async convertMediaMessage(content: any, contentType: keyof proto.IMessage) {
    var msg = new MediaMessage(this._chat, "", Buffer.from(""));

    const file: Media = { stream: this._message };

    if (contentType == "documentMessage") {
      msg = new FileMessage(this._chat, this._convertedMessage.text, file);
    }

    if (contentType == "imageMessage") {
      msg = new ImageMessage(this._chat, this._convertedMessage.text, file);
    }

    if (contentType == "videoMessage") {
      msg = new VideoMessage(this._chat, this._convertedMessage.text, file);
    }

    if (contentType == "audioMessage") {
      msg = new AudioMessage(this._chat, file);
    }

    if (contentType == "stickerMessage") {
      msg = new StickerMessage(this._chat, file);

      try {
        await extractMetadata(await this._wa.downloadStreamMessage(file))
          .then((data) => {
            if (isStickerMessage(msg)) {
              msg.author = data["sticker-pack-publisher"] || "";
              msg.stickerId = data["sticker-pack-id"] || "";
              msg.pack = data["sticker-pack-name"] || "";
            }
          })
          .catch((err) => {
            this._wa.ev.emit("error", err);
          });
      } catch (err) {
        this._wa.ev.emit("error", err);
      }
    }

    if (content.gifPlayback) {
      msg.isGIF = true;
    }

    if (!!content.mimetype) {
      msg.mimetype = content.mimetype;
    }

    if (!!content.fileName) {
      msg.name = content.fileName;
    }

    this._convertedMessage = msg;
  }

  /**
   * * Converte uma mensagem de reação
   * @param content
   */
  public convertReactionMessage(content: any) {
    this._convertedMessage = new ReactionMessage(this._chat, content.text, content.key.id);
  }

  /**
   * * Converte uma mensagem de enquete
   * @param content
   */
  public convertPollCreationMessage(content: proto.Message.PollCreationMessage) {
    const pollCreation = this._wa.polls[this._chat.id];

    const pollMessage = new PollMessage(this._chat, content.name);

    if (!!pollCreation && pollCreation?.options && pollCreation?.options?.length > 0) {
      pollMessage.options = pollCreation.options;
    } else {
      for (const opt of content.options) {
        pollMessage.addOption(opt.optionName);
      }
    }

    this._convertedMessage = pollMessage;
  }

  /**
   * * Converte uma mensagem de enquete atualizada
   * @param content
   */
  public async convertPollUpdateMessage(content: proto.Message.PollUpdateMessage) {
    const pollCreation = this._wa.polls[content.pollCreationMessageKey.id];
    const pollUpdate = new PollUpdateMessage(this._chat, pollCreation?.text || "");

    if (pollCreation) {
      const userId = this._user.id;

      const poll = decryptPollVote(content.vote, {
        pollCreatorJid: getID(pollCreation.user.id),
        pollMsgId: content.pollCreationMessageKey.id,
        pollEncKey: pollCreation.secretKey,
        voterJid: getID(userId),
      });

      const votesAlias: { [name: string]: PollOption } = {};
      const hashVotes: string[] = poll.selectedOptions.map((opt) => Buffer.from(opt).toString("hex").toUpperCase()).sort();
      const oldVotes: string[] = pollCreation.getUserVotes(userId).sort();
      const nowVotes: string[] = [];

      for (const opt of pollCreation.options) {
        const hash = Buffer.from(digestSync("SHA-256", new TextEncoder().encode(Buffer.from(opt.name).toString())))
          .toString("hex")
          .toUpperCase();

        votesAlias[opt.name] = opt;

        if (hashVotes.includes(hash)) {
          nowVotes.push(opt.name);
        }
      }

      let vote: PollOption | null = null;

      const avaibleVotes = Object.keys(votesAlias);

      for (const name of avaibleVotes) {
        if (nowVotes.length > oldVotes.length) {
          if (oldVotes.includes(name) || !nowVotes.includes(name)) continue;

          vote = votesAlias[name];

          pollUpdate.action = "add";

          break;
        } else {
          if (nowVotes.includes(name) || !oldVotes.includes(name)) continue;

          vote = votesAlias[name];

          pollUpdate.action = "remove";

          break;
        }
      }

      pollUpdate.selected = vote?.id || "";
      pollUpdate.text = vote?.name || "";

      pollCreation.setUserVotes(userId, nowVotes);

      this._wa.polls[pollCreation.id] = pollCreation;

      await this._wa.savePolls(this._wa.polls);
    }

    this._convertedMessage = pollUpdate;
  }

  /**
   * * Converte uma mensagem de botão
   * @param content
   * @returns
   */
  public convertButtonMessage(content: WAMessageContent) {
    let buttonMessage: any = content.buttonsMessage || content.templateMessage;
    const buttonMSG = new ButtonMessage(this._chat, "", "");

    if (buttonMessage.hydratedTemplate) buttonMessage = buttonMessage.hydratedTemplate;

    buttonMSG.text = buttonMessage.contentText || buttonMessage.hydratedContentText || "";
    buttonMSG.footer = buttonMessage.footerText || buttonMessage.hydratedFooterText || "";
    // buttonMSG.setType(buttonMessage.headerType || buttonMessage.hydratedHeaderType || 1)

    if (buttonMessage.buttons) {
      buttonMSG.type = MessageType.Button;

      buttonMessage.buttons?.map((button: proto.Message.ButtonsMessage.IButton) => {
        buttonMSG.addReply(button?.buttonText?.displayText || "", button.buttonId || String(Date.now()));
      });
    }

    if (buttonMessage.hydratedButtons) {
      buttonMSG.type = MessageType.TemplateButton;

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
    }

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

    const listMSG = new ListMessage(this._chat, "", "");

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
