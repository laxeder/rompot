import { decryptPollVote, getContentType, isJidGroup, MessageUpsertType, proto, WAMessage, WAMessageContent, WAMessageUpdate } from "@whiskeysockets/baileys";
import { extractMetadata } from "@laxeder/wa-sticker/dist";
import digestSync from "crypto-digest-sync";
import Long from "long";

import PollMessage, { PollAction, PollOption } from "../messages/PollMessage";
import Message, { MessageStatus, MessageType } from "../messages/Message";
import ListMessage, { ListType } from "../messages/ListMessage";
import MediaMessage, { Media } from "../messages/MediaMessage";
import PollUpdateMessage from "../messages/PollUpdateMessage";
import LocationMessage from "../messages/LocationMessage";
import ReactionMessage from "../messages/ReactionMessage";
import ContactMessage from "../messages/ContactMessage";
import StickerMessage from "../messages/StickerMessage";
import ButtonMessage from "../messages/ButtonMessage";
import ImageMessage from "../messages/ImageMessage";
import AudioMessage from "../messages/AudioMessage";
import VideoMessage from "../messages/VideoMessage";
import EmptyMessage from "../messages/EmptyMessage";
import TextMessage from "../messages/TextMessage";
import FileMessage from "../messages/FileMessage";
import { ChatType } from "../chat/ChatType";
import WhatsAppBot from "./WhatsAppBot";
import User from "../user/User";
import Chat from "../chat/Chat";

export class ConvertWAMessage {
  public type?: MessageUpsertType;
  public waMessage: WAMessage = { key: {} };

  private message: Message = new Message();
  private bot: WhatsAppBot;

  constructor(bot: WhatsAppBot, waMessage: WAMessage, type?: MessageUpsertType) {
    this.bot = bot;

    this.set(waMessage, type);
  }

  /**
   * * Define a mensagem a ser convertida
   * @param waMessage
   * @param type
   */
  public set(waMessage: WAMessage = this.waMessage, type?: MessageUpsertType) {
    this.waMessage = waMessage;
    this.type = type;
  }

  /**
   * * Retorna a mensagem convertida
   */
  public async get() {
    await this.convertMessage(this.waMessage, this.type);

    return this.message;
  }

  /**
   * * Converte a mensagem
   * @param waMessage
   * @param type
   */
  public async convertMessage(waMessage: WAMessage, type: MessageUpsertType = "notify") {
    if (!waMessage) {
      this.message = EmptyMessage.fromJSON({ ...this.message, type: MessageType.Empty });
      return;
    }

    if (waMessage.message) {
      await this.convertContentMessage(waMessage.message);

      if (Long.isLong(this.waMessage.messageTimestamp)) {
        this.message.timestamp = (this.waMessage.messageTimestamp.toNumber() || 0) * 1000 || Date.now();
      } else {
        this.message.timestamp = (this.waMessage.messageTimestamp || 0) * 1000 || Date.now();
      }
    }

    this.message.isUnofficial = waMessage.key.id.length < 20;
    this.message.fromMe = !!this.waMessage.key.fromMe;
    this.message.id = this.message.id || this.waMessage.key.id || "";

    this.message.chat = new Chat(waMessage?.key?.remoteJid || this.bot.id);
    this.message.chat.type = isJidGroup(this.message.chat.id) ? ChatType.Group : ChatType.PV;
    this.message.status = ConvertWAMessage.convertMessageStatus(ConvertWAMessage.isMessageUpdate(waMessage) ? waMessage.update.status : waMessage.status);

    this.message.user = new User(waMessage.key.fromMe ? this.bot.id : waMessage.key.participant || waMessage.participant || waMessage.key.remoteJid || "");
  }

  /**
   * * Converte o conteudo da mensagem
   * @param messageContent
   * @returns
   */
  public async convertContentMessage(messageContent: proto.IMessage | undefined | null) {
    if (!!!messageContent) {
      this.message = EmptyMessage.fromJSON({ ...this.message, type: MessageType.Empty });
      return;
    }

    if (messageContent?.viewOnceMessage?.message || messageContent?.viewOnceMessageV2?.message || messageContent?.viewOnceMessageV2Extension?.message) {
      messageContent = messageContent?.viewOnceMessage?.message || messageContent?.viewOnceMessageV2?.message || messageContent?.viewOnceMessageV2Extension?.message;

      this.message.isViewOnce = true;
    }

    if (messageContent.editedMessage) {
      this.message.id = messageContent.editedMessage.message.protocolMessage.key.id;
      this.message.isEdited = true;

      messageContent = messageContent.editedMessage.message.protocolMessage.editedMessage;
    }

    const contentType = getContentType(messageContent);

    if (!contentType) {
      this.message = EmptyMessage.fromJSON({ ...this.message, type: MessageType.Empty });
      return;
    }

    if (contentType == "conversation") {
      this.convertConversationMessage(messageContent[contentType]);
    }

    if (contentType == "extendedTextMessage") {
      this.convertExtendedTextMessage(messageContent[contentType]);
    }

    if (contentType == "protocolMessage") {
      this.convertProtocolMessage(messageContent[contentType] as proto.Message.IProtocolMessage);
    }

    if (contentType == "imageMessage" || contentType == "videoMessage" || contentType == "audioMessage" || contentType == "stickerMessage" || contentType == "documentMessage") {
      await this.convertMediaMessage(messageContent[contentType], contentType);
    }

    if (contentType === "buttonsMessage" || contentType === "templateMessage") {
      this.convertButtonMessage(messageContent);
    }

    if (contentType === "listMessage") {
      this.convertListMessage(messageContent);
    }

    if (contentType === "locationMessage") {
      this.convertLocationMessage(messageContent[contentType]);
    }

    if (contentType === "contactMessage" || contentType == "contactsArrayMessage") {
      this.convertContactMessage(messageContent[contentType]);
    }

    if (contentType === "reactionMessage") {
      this.convertReactionMessage(messageContent[contentType]);
    }

    if (contentType === "pollCreationMessage") {
      await this.convertPollCreationMessage(messageContent[contentType] as proto.Message.PollCreationMessage);
    }

    if (contentType == "pollUpdateMessage") {
      await this.convertPollUpdateMessage(messageContent[contentType] as proto.Message.PollUpdateMessage);
    }

    const content = messageContent[contentType] as any;

    this.message.text = this.message.text || content.text || content.caption || content.buttonText || content.hydratedTemplate?.hydratedContentText || content.displayName || content.contentText || "";
    this.message.selected = content?.singleSelectReply?.selectedRowId || content?.selectedId || "";

    if (content.contextInfo) {
      await this.convertContextMessage(content.contextInfo as proto.ContextInfo);
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
        this.message.mentions.push(jid);
      }
    }

    if (context.quotedMessage) {
      const message = {
        key: {
          remoteJid: this.waMessage?.key?.remoteJid || this.bot.id,
          participant: context.participant,
          id: context.stanzaId,
        },
        message: context.quotedMessage,
      };

      this.message.mention = await new ConvertWAMessage(this.bot, message).get();
    }
  }

  /**
   * * Converte mensagem de conversa
   * @param content
   */
  public convertConversationMessage(content: proto.Message["conversation"]) {
    this.message = TextMessage.fromJSON({ ...this.message, type: MessageType.Text, text: content });
  }

  /**
   * * Converte mensagem de texto
   * @param content
   */
  public convertExtendedTextMessage(content: proto.Message["extendedTextMessage"]) {
    this.message = TextMessage.fromJSON({ ...this.message, type: MessageType.Text, text: content });
  }

  /**
   * * Converte mensagem de protocolo
   * @param content
   */
  public convertProtocolMessage(content: proto.Message["protocolMessage"]) {
    if (content.type == 0) {
      this.waMessage.key = { ...this.waMessage.key, ...content.key };
      this.message.isDeleted = true;
    } else {
      this.message = EmptyMessage.fromJSON({ ...this.message, type: MessageType.Empty });
    }
  }

  /**
   * * Converte mensagem de localização
   * @param content
   */
  public convertLocationMessage(content: any) {
    this.message = LocationMessage.fromJSON({ ...this.message, type: MessageType.Location, latitude: content.degreesLatitude, longitude: content.degreesLongitude });
  }

  /**
   * * Converte mensagem com contatos
   * @param content
   */
  public convertContactMessage(content: any) {
    const msg = ContactMessage.fromJSON({ ...this.message, type: MessageType.Contact, text: content.displayName });

    const getContact = (vcard: string | any): User => {
      const user = new User("");

      if (typeof vcard == "object") {
        vcard = vcard.vcard;
      }

      const name = vcard.slice(vcard.indexOf("FN:"));
      user.name = name.slice(3, name.indexOf("\n"));

      const id = vcard.slice(vcard.indexOf("waid=") + 5);
      user.id = id.slice(0, id.indexOf(":")) + "@s.whatsapp.net";

      return user;
    };

    if (content.contacts) {
      content.contacts = content.contacts.map((vcard: string) => getContact(vcard));
    }

    if (content.vcard) {
      msg.contacts = [getContact(content.vcard)];
    }

    this.message = msg;
  }

  /**
   * * Converte mensagem de midia
   * @param content
   * @param contentType
   */
  public async convertMediaMessage(content: any, contentType: keyof proto.Message) {
    var msg = MediaMessage.fromJSON({ ...this.message, type: MessageType.Media });

    const file: Media = { stream: this.waMessage };

    if (contentType == "documentMessage") {
      msg = FileMessage.fromJSON({ ...msg, type: MessageType.File, file });
    }

    if (contentType == "imageMessage") {
      msg = ImageMessage.fromJSON({ ...msg, type: MessageType.Image, file });
    }

    if (contentType == "videoMessage") {
      msg = VideoMessage.fromJSON({ ...msg, type: MessageType.Video, file });
    }

    if (contentType == "audioMessage") {
      msg = AudioMessage.fromJSON({ ...msg, type: MessageType.Audio, file });
    }

    if (contentType == "stickerMessage") {
      msg = StickerMessage.fromJSON({ ...msg, type: MessageType.Sticker, file });

      try {
        await extractMetadata(await this.bot.downloadStreamMessage(file))
          .then((data) => {
            if (StickerMessage.isValid(msg)) {
              msg.author = data["sticker-pack-publisher"] || "";
              msg.stickerId = data["sticker-pack-id"] || "";
              msg.pack = data["sticker-pack-name"] || "";
            }
          })
          .catch((err) => {
            this.bot.emit("error", err);
          });
      } catch (err) {
        this.bot.emit("error", err);
      }
    }

    msg.isGIF = !!content.gifPlayback;
    msg.name = content.fileName || msg.name;
    msg.mimetype = content.mimetype || msg.mimetype;

    this.message = msg;
  }

  /**
   * * Converte uma mensagem de reação
   * @param content
   */
  public convertReactionMessage(content: any) {
    this.message = ReactionMessage.fromJSON({ ...this.message, text: content.text, id: content.key.id });
  }

  /**
   * * Converte uma mensagem editada
   * @param content
   */
  public async convertEditedMessage(content: proto.IMessage["protocolMessage"]) {
    await this.convertContentMessage(content.editedMessage);

    this.message.id = content.key.id;
    this.message.isEdited = true;
  }

  /**
   * * Converte uma mensagem de enquete
   * @param content
   */
  public async convertPollCreationMessage(content: proto.Message.PollCreationMessage) {
    const pollCreation = await this.bot.getPollMessage(this.waMessage.key.id || "");

    const pollMessage = PollMessage.fromJSON({ ...this.message, type: MessageType.Poll, text: content.name });

    if (!!pollCreation && pollCreation?.options && pollCreation?.options?.length > 0) {
      pollMessage.options = pollCreation.options;
    } else {
      for (const opt of content.options) {
        pollMessage.addOption(opt.optionName);
      }
    }

    this.message = pollMessage;
  }

  /**
   * * Converte uma mensagem de enquete atualizada
   * @param content
   */
  public async convertPollUpdateMessage(content: proto.Message.PollUpdateMessage) {
    const pollCreation = await this.bot.getPollMessage(this.waMessage.key.id || "");
    const pollUpdate = PollUpdateMessage.fromJSON({ ...this.message, type: MessageType.PollUpdate, text: pollCreation.text });

    const userId = this.waMessage.key.fromMe ? this.bot.id : this.waMessage.key.participant || this.waMessage.participant || this.waMessage.key.remoteJid || "";

    if (pollCreation) {
      const poll = decryptPollVote(content.vote, {
        pollCreatorJid: pollCreation.user.id,
        pollMsgId: content.pollCreationMessageKey.id,
        pollEncKey: pollCreation.secretKey,
        voterJid: userId,
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

          pollUpdate.action = PollAction.Add;

          break;
        } else {
          if (nowVotes.includes(name) || !oldVotes.includes(name)) continue;

          vote = votesAlias[name];

          pollUpdate.action = PollAction.Remove;

          break;
        }
      }

      pollUpdate.selected = vote?.id || "";
      pollUpdate.text = vote?.name || "";

      pollCreation.setUserVotes(userId, nowVotes);

      await this.bot.savePollMessage(pollCreation);
    }

    this.message = pollUpdate;
  }

  /**
   * * Converte uma mensagem de botão
   * @param content
   * @returns
   */
  public convertButtonMessage(content: WAMessageContent) {
    let buttonMessage: any = content.buttonsMessage || content.templateMessage;
    const buttonMSG = ButtonMessage.fromJSON({ ...this.message, type: MessageType.Button });

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

    this.message = buttonMSG;
  }

  /**
   * * Converte uma mensagem de lista
   * @param content
   * @returns
   */
  public convertListMessage(content: WAMessageContent) {
    let listMessage = content.listMessage;

    if (!!!listMessage) return;

    const listMSG = ListMessage.fromJSON({ ...this.message, type: MessageType.List });

    listMSG.text = listMessage.description || "";
    listMSG.title = listMessage.title || "";
    listMSG.footer = listMessage.footerText || "";
    listMSG.button = listMessage.buttonText || "";
    listMSG.listType = listMessage.listType || ListType.UNKNOWN;

    listMessage?.sections?.map((list) => {
      const index = listMSG.list.length;
      listMSG.addCategory(list.title || "");

      list.rows?.map((item) => {
        listMSG.addItem(index, item.title || "", item.description || "", item.rowId || "");
      });
    });

    this.message = listMSG;
  }

  public static convertMessageStatus(status?: proto.WebMessageInfo.Status): MessageStatus {
    if (status == proto.WebMessageInfo.Status.ERROR) return MessageStatus.Error;
    if (status == proto.WebMessageInfo.Status.PENDING) return MessageStatus.Sending;
    if (status == proto.WebMessageInfo.Status.SERVER_ACK) return MessageStatus.Sended;
    if (status == proto.WebMessageInfo.Status.DELIVERY_ACK) return MessageStatus.Received;
    if (status == proto.WebMessageInfo.Status.READ) return MessageStatus.Readed;
    if (status == proto.WebMessageInfo.Status.PLAYED) return MessageStatus.Played;

    return MessageStatus.Sending;
  }

  public static isMessageUpdate(waMessage: any): waMessage is WAMessageUpdate {
    return !!waMessage && typeof waMessage == "object" && !!waMessage?.update && typeof waMessage?.update == "object" && waMessage?.update?.status != undefined;
  }
}
