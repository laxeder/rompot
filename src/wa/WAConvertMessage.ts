import type { Media, PollOption } from "../types/Message";

import { decryptPollVote, getContentType, MessageUpsertType, proto, WAMessage, WAMessageContent } from "@whiskeysockets/baileys";
import { extractMetadata } from "@laxeder/wa-sticker/dist";
import digestSync from "crypto-digest-sync";
import Long from "long";

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
  private type?: MessageUpsertType;
  private message: any = {};

  private convertedMessage: IMessage = new Message("", "");
  private user: User = new User("");
  private chat: Chat = new Chat("");
  private mention?: IMessage;
  private wa: WhatsAppBot;

  constructor(wa: WhatsAppBot, message: WAMessage, type?: MessageUpsertType) {
    this.wa = wa;

    this.set(message, type);
  }

  /**
   * * Define a mensagem a ser convertida
   * @param message
   * @param type
   */
  public set(message: WAMessage = this.message, type?: MessageUpsertType) {
    this.message = message;
    this.type = type;
  }

  /**
   * * Retorna a mensagem convertida
   */
  public async get() {
    await this.convertMessage(this.message, this.type);

    if (this.mention) this.convertedMessage.mention = this.mention;

    this.convertedMessage.chat = new Chat(this.chat.id, this.chat.type, this.chat.name);
    this.convertedMessage.user = new User(this.user.id, this.user.name);

    return this.convertedMessage;
  }

  /**
   * * Converte a mensagem
   * @param message
   * @param type
   */
  public async convertMessage(message: WAMessage, type: MessageUpsertType = "notify") {
    if (!!!message) {
      this.convertedMessage = new EmptyMessage();

      return;
    }

    const id = replaceID(message?.key?.remoteJid || "");

    const chat = this.wa.chats[id] ? this.wa.chats[id] : new WAChat(id);

    if (id) {
      if (chat) this.chat = chat;

      this.chat.id = id;
    }

    if (chat?.id.includes("@g")) {
      this.chat.type = "group";
      this.chat.name = this.wa.chats[chat.id]?.name || "";
    }

    if (chat?.id.includes("@s") || !chat.id.includes("@")) {
      this.chat.type = "pv";

      if (!message.key.fromMe) {
        this.chat.name = message.pushName;

        //? O WhatsApp não envia o nome de um chat privado normalmente, então recolho ele da mensagem
        if (!this.wa.chats.hasOwnProperty(id) || (!!this.chat.name && this.wa.chats[id].name != this.chat.name)) {
          await this.wa.addChat(this.chat);
        }
      }
    }

    const userID = replaceID(message.key.fromMe ? this.wa.id : message.key.participant || message.participant || message.key.remoteJid || "");
    const user = this.wa.users[userID] || new WAUser(userID);

    if (!!message.pushName) user.name = message.pushName;

    //? O WhatsApp não envia o nome do usuário normalmente, então recolho ele da mensagem
    if (!this.wa.users.hasOwnProperty(userID) || (!!user.name && this.wa.users[userID].name != user.name)) {
      await this.wa.addUser(user);
    }

    this.user = user;

    await this.convertContentMessage(message.message);

    if (this.message.key.fromMe) {
      this.convertedMessage.fromMe = this.message.key.fromMe;
      this.user.id = replaceID(this.wa.id);
    }

    this.convertedMessage.apiSend = this.wa.apiMessagesId.includes(this.message.key.id);

    if (Long.isLong(this.message.messageTimestamp)) {
      this.message.messageTimestamp = this.message.messageTimestamp.toNumber();
    }

    if (this.message.messageTimestamp) this.convertedMessage.timestamp = this.message.messageTimestamp;
    if (this.message.key.id) this.convertedMessage.id = this.message.key.id;
    // if (type) this.convertedMessage.isOld = type !== "notify";
  }

  /**
   * * Converte o conteudo da mensagem
   * @param messageContent
   * @returns
   */
  public async convertContentMessage(messageContent: WAMessageContent | undefined | null) {
    if (!!!messageContent) {
      this.convertedMessage = new EmptyMessage();

      return;
    }

    const contentType = getContentType(messageContent);

    if (!contentType) {
      this.convertedMessage = new EmptyMessage();
      return;
    }

    if (contentType == "protocolMessage") {
      if (!!messageContent[contentType]?.historySyncNotification) {
        this.convertedMessage = new EmptyMessage();
        return;
      }

      if (!!messageContent[contentType].editedMessage) {
        await this.convertEditedMessage(messageContent[contentType]);
        return;
      }

      this.convertedMessage.isDeleted = true;
    }

    let content: any = contentType === "conversation" ? { text: messageContent[contentType] } : messageContent[contentType];

    if (content.message) {
      await this.convertContentMessage(content.message);
      return;
    }

    if (contentType == "editedMessage") {
      await this.convertEditedMessage(messageContent[contentType].message);
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

    if (!!!this.convertedMessage.text) {
      this.convertedMessage.text =
        content.text || content.caption || content.buttonText || content.hydratedTemplate?.hydratedContentText || content.displayName || content.contentText || this.convertedMessage.text || "";
    }

    if (content.contextInfo) {
      await this.convertContextMessage(content.contextInfo);
    }

    if (content.singleSelectReply?.selectedRowId) {
      this.convertedMessage.selected = content.singleSelectReply.selectedRowId;
    }

    if (content.selectedId) {
      this.convertedMessage.selected = content.selectedId;
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
        this.convertedMessage.mentions.push(replaceID(jid));
      }
    }

    if (context.quotedMessage) {
      const message = {
        key: {
          remoteJid: replaceID(this.chat.id),
          participant: replaceID(context.participant),
          id: context.stanzaId,
        },
        message: context.quotedMessage,
      };

      const wa = new WhatsAppConvertMessage(this.wa, message);

      this.mention = await wa.get();
    }
  }

  /**
   * * Converte mensagem de localização
   * @param content
   */
  public convertLocationMessage(content: any) {
    this.convertedMessage = new LocationMessage(this.chat, content.degreesLatitude, content.degreesLongitude);
  }

  /**
   * * Converte mensagem com contatos
   * @param content
   */
  public convertContactMessage(content: any) {
    const msg = new ContactMessage(this.chat, content.displayName, []);

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

    this.convertedMessage = msg;
  }

  /**
   * * Converte mensagem de midia
   * @param content
   * @param contentType
   */
  public async convertMediaMessage(content: any, contentType: keyof proto.IMessage) {
    var msg = new MediaMessage(this.chat, "", Buffer.from(""));

    const file: Media = { stream: this.message };

    if (contentType == "documentMessage") {
      msg = new FileMessage(this.chat, this.convertedMessage.text, file);
    }

    if (contentType == "imageMessage") {
      msg = new ImageMessage(this.chat, this.convertedMessage.text, file);
    }

    if (contentType == "videoMessage") {
      msg = new VideoMessage(this.chat, this.convertedMessage.text, file);
    }

    if (contentType == "audioMessage") {
      msg = new AudioMessage(this.chat, file);
    }

    if (contentType == "stickerMessage") {
      msg = new StickerMessage(this.chat, file);

      try {
        await extractMetadata(await this.wa.downloadStreamMessage(file))
          .then((data) => {
            if (isStickerMessage(msg)) {
              msg.author = data["sticker-pack-publisher"] || "";
              msg.stickerId = data["sticker-pack-id"] || "";
              msg.pack = data["sticker-pack-name"] || "";
            }
          })
          .catch((err) => {
            this.wa.ev.emit("error", err);
          });
      } catch (err) {
        this.wa.ev.emit("error", err);
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

    this.convertedMessage = msg;
  }

  /**
   * * Converte uma mensagem de reação
   * @param content
   */
  public convertReactionMessage(content: any) {
    this.convertedMessage = new ReactionMessage(this.chat, content.text, content.key.id);
  }

  /**
   * * Converte uma mensagem editada
   * @param content
   */
  public async convertEditedMessage(content: any) {
    this.set({ ...content, message: content.editedMessage }, this.type);

    await this.get();

    this.convertedMessage.isEdited = true;
  }

  /**
   * * Converte uma mensagem de enquete
   * @param content
   */
  public convertPollCreationMessage(content: proto.Message.PollCreationMessage) {
    const pollCreation = this.wa.polls[this.chat.id];

    const pollMessage = new PollMessage(this.chat, content.name);

    if (!!pollCreation && pollCreation?.options && pollCreation?.options?.length > 0) {
      pollMessage.options = pollCreation.options;
    } else {
      for (const opt of content.options) {
        pollMessage.addOption(opt.optionName);
      }
    }

    this.convertedMessage = pollMessage;
  }

  /**
   * * Converte uma mensagem de enquete atualizada
   * @param content
   */
  public async convertPollUpdateMessage(content: proto.Message.PollUpdateMessage) {
    const pollCreation = this.wa.polls[content.pollCreationMessageKey.id];
    const pollUpdate = new PollUpdateMessage(this.chat, pollCreation?.text || "");

    if (pollCreation) {
      const userId = this.user.id;

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

      this.wa.polls[pollCreation.id] = pollCreation;

      await this.wa.savePolls(this.wa.polls);
    }

    this.convertedMessage = pollUpdate;
  }

  /**
   * * Converte uma mensagem de botão
   * @param content
   * @returns
   */
  public convertButtonMessage(content: WAMessageContent) {
    let buttonMessage: any = content.buttonsMessage || content.templateMessage;
    const buttonMSG = new ButtonMessage(this.chat, "", "");

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

    this.convertedMessage = buttonMSG;
  }

  /**
   * * Converte uma mensagem de lista
   * @param content
   * @returns
   */
  public convertListMessage(content: WAMessageContent) {
    let listMessage = content.listMessage;

    if (!!!listMessage) return;

    const listMSG = new ListMessage(this.chat, "", "");

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

    this.convertedMessage = listMSG;
  }
}
