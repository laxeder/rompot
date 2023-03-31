import { decryptPollVote, getContentType, MessageUpsertType, proto, WAMessage, WAMessageContent } from "@adiwajshing/baileys";
import { extractMetadata } from "wa-sticker-formatter/dist";
import * as crypto from "crypto";

import PollUpdateMessage from "@messages/PollUpdateMessage";
import ReactionMessage from "@messages/ReactionMessage";
import LocationMessage from "@messages/LocationMessage";
import ContactMessage from "@messages/ContactMessage";
import StickerMessage from "@messages/StickerMessage";
import ButtonMessage from "@messages/ButtonMessage";
import MediaMessage from "@messages/MediaMessage";
import ImageMessage from "@messages/ImageMessage";
import VideoMessage from "@messages/VideoMessage";
import AudioMessage from "@messages/AudioMessage";
import ListMessage from "@messages/ListMessage";
import FileMessage from "@messages/FileMessage";
import PollMessage from "@messages/PollMessage";
import Message from "@messages/Message";

import Chat from "@modules/Chat";
import User from "@modules/User";

import WhatsAppBot from "@wa/WhatsAppBot";
import { getID, replaceID } from "@wa/ID";

import { Media, PollOption } from "../types/Message";

export class WhatsAppConvertMessage {
  private _type?: MessageUpsertType;
  private _message: any = {};

  private _convertedMessage: Message = new Message("", "");
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
    const id = replaceID(message?.key?.remoteJid || "");

    const chat = this._wa.chats[id] ? this._wa.chats[id] : new Chat(id);

    if (id) {
      if (chat) this._chat = chat;

      this._chat.id = id;
    }

    if (chat?.id.includes("@g")) this._chat.type = "group";
    if (chat?.id.includes("@s")) this._chat.type = "pv";

    if (message.pushName) this._chat.name = message.pushName;

    const userID = replaceID(message.key.participant || message.participant || message.key.remoteJid || "");
    this._user = chat?.users && chat?.users[userID] ? chat?.users[userID] : new User(userID);
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
      const user = new User("");

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

      const data = await extractMetadata(await this._wa.downloadStreamMessage(file));

      if (msg instanceof StickerMessage) {
        msg.author = data["sticker-pack-publisher"] || "";
        msg.id = data["sticker-pack-id"] || msg.id;
        msg.pack = data["sticker-pack-name"] || "";
      }
    }

    if (content.gifPlayback) {
      msg.isGIF = true;
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

      const hashVotes = poll.selectedOptions.map((opt) => Buffer.from(opt).toString("hex").toUpperCase()).sort();
      const userHashVotes = pollCreation.getUserVotes(userId).sort();

      const options: { [x: string]: PollOption } = {};

      await Promise.all(
        pollCreation.options.map(async (opt) => {
          const hash = Buffer.from(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(Buffer.from(opt.name).toString())))
            .toString("hex")
            .toUpperCase();

          options[hash] = opt;
        })
      );

      let vote: PollOption | null = null;

      for (const hash of Object.keys(options)) {
        if (hashVotes.length > userHashVotes.length) {
          if (userHashVotes.includes(hash)) continue;

          vote = options[hash];

          pollUpdate.action = "add";
        } else {
          if (hashVotes.includes(hash)) continue;

          vote = options[hash];

          pollUpdate.action = "remove";
        }
      }

      pollUpdate.selected = vote?.id || "";
      pollUpdate.text = vote?.name || "";

      pollCreation.setUserVotes(userId, hashVotes);
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

    buttonMessage.buttons?.map((button: proto.Message.ButtonsMessage.IButton) => {
      buttonMSG.addReply(button?.buttonText?.displayText || "", button.buttonId || String(Date.now()));
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
