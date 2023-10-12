import { decryptPollVote, getContentType, isJidGroup, MessageUpsertType, proto, WAMessage, WAMessageContent } from "@whiskeysockets/baileys";
import { extractMetadata } from "@laxeder/wa-sticker/dist";
import digestSync from "crypto-digest-sync";
import Long from "long";

import PollMessage, { PollAction, PollOption } from "../messages/PollMessage";
import MediaMessage, { Media } from "../messages/MediaMessage";
import PollUpdateMessage from "../messages/PollUpdateMessage";
import Message, { MessageType } from "../messages/Message";
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
import ListMessage from "../messages/ListMessage";
import FileMessage from "../messages/FileMessage";
import { ChatType } from "../chat/ChatType";
import { getID, replaceID } from "./ID";
import WhatsAppBot from "./WhatsAppBot";
import User from "../user/User";
import Chat from "../chat/Chat";

export class ConvertWAMessage {
  public type?: MessageUpsertType;
  public waMessage: WAMessage = { key: {} };

  private message: Message = new Message();
  private user: User = new User("");
  private chat: Chat = new Chat("");
  private mention?: Message;
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

    if (this.mention) this.message.mention = this.mention;

    this.message.chat = this.chat;
    this.message.user = this.user;

    return this.message;
  }

  /**
   * * Converte a mensagem
   * @param waMessage
   * @param type
   */
  public async convertMessage(waMessage: WAMessage, type: MessageUpsertType = "notify") {
    if (!waMessage) {
      this.message = new EmptyMessage();

      return;
    }

    const jid = waMessage?.key?.remoteJid || this.bot.id;

    this.chat = (await this.bot.getChat(new Chat(jid))) || new Chat(replaceID(jid));

    this.chat.type = isJidGroup(jid) ? ChatType.Group : ChatType.PV;

    if (this.chat.type == ChatType.PV && !waMessage.key.fromMe) {
      if (this.chat.name != waMessage.pushName) {
        await this.bot.setChat(Chat.fromJSON({ ...this.chat, name: waMessage.pushName }));
      }

      this.chat.name = waMessage.pushName;
    }

    const userJid = waMessage.key.fromMe ? this.bot.id : waMessage.key.participant || waMessage.participant || waMessage.key.remoteJid || "";

    this.user = (await this.bot.getUser(new User(jid))) || new User(replaceID(userJid));

    if (this.user.name != waMessage.pushName) {
      await this.bot.setUser(User.fromJSON({ ...this.user, name: waMessage.pushName }));
    }

    this.user.name = waMessage.pushName || this.user.name;

    await this.convertContentMessage(waMessage.message);

    this.message.fromMe = !!this.waMessage.key.fromMe;
    this.message.id = this.waMessage.key.id || "";
    this.message.isUnofficial = waMessage.key.id.length < 20;

    if (Long.isLong(this.waMessage.messageTimestamp)) {
      this.waMessage.messageTimestamp = this.waMessage.messageTimestamp.toNumber() * 1000;
    } else if (this.waMessage.messageTimestamp) {
      this.message.timestamp = this.waMessage.messageTimestamp * 1000;
    } else {
      this.message.timestamp = Date.now();
    }
  }

  /**
   * * Converte o conteudo da mensagem
   * @param messageContent
   * @returns
   */
  public async convertContentMessage(messageContent: WAMessageContent | undefined | null) {
    if (!!!messageContent) {
      this.message = new EmptyMessage();

      return;
    }

    let contentType = getContentType(messageContent);

    if (!contentType) {
      this.message = new EmptyMessage();
      return;
    }

    if (contentType == "conversation") {
      this.convertConversationMessage(messageContent[contentType]);
      return;
    }

    if (contentType == "extendedTextMessage") {
      this.convertExtendedTextMessage(messageContent[contentType]);
    }

    const content = messageContent[contentType] as any;

    if ((content as proto.IWebMessageInfo).message) {
      await this.convertContentMessage((content as proto.IWebMessageInfo).message);
      return;
    }

    if (contentType == "protocolMessage") {
      await this.convertProtocolMessage(messageContent[contentType] as proto.Message.IProtocolMessage);
      return;
    }

    if (contentType == "editedMessage") {
      await this.convertEditedMessage((messageContent[contentType] as WAMessageContent["editedMessage"]).message);
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
      this.convertPollCreationMessage(content as proto.Message.PollCreationMessage);
    }

    if (contentType == "pollUpdateMessage") {
      await this.convertPollUpdateMessage(content as proto.Message.PollUpdateMessage);
    }

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
        this.message.mentions.push(replaceID(jid));
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

      this.mention = await new ConvertWAMessage(this.bot, message).get();
    }
  }

  /**
   * * Converte mensagem de conversa
   * @param content
   */
  public convertConversationMessage(content: proto.Message["conversation"]) {
    this.message = new TextMessage(this.chat, content);
  }

  /**
   * * Converte mensagem de texto
   * @param content
   */
  public convertExtendedTextMessage(content: proto.Message["extendedTextMessage"]) {
    this.message = new TextMessage(this.chat, content.text);
  }

  /**
   * * Converte mensagem de protocolo
   * @param content
   */
  public async convertProtocolMessage(content: proto.Message["protocolMessage"]) {
    if (content.type == 0) {
      this.message.isDeleted = true;
    }

    if (content.type == 14) {
      await this.convertEditedMessage(content as proto.Message["editedMessage"]["message"]);
    }

    this.message = new EmptyMessage();
  }

  /**
   * * Converte mensagem de localização
   * @param content
   */
  public convertLocationMessage(content: any) {
    this.message = new LocationMessage(this.chat, content.degreesLatitude, content.degreesLongitude);
  }

  /**
   * * Converte mensagem com contatos
   * @param content
   */
  public convertContactMessage(content: any) {
    const msg = new ContactMessage(this.chat, content.displayName, []);

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
    var msg = new MediaMessage(this.chat, "", Buffer.from(""));

    const file: Media = { stream: this.waMessage };

    if (contentType == "documentMessage") {
      msg = new FileMessage(this.chat, this.message.text, file);
    }

    if (contentType == "imageMessage") {
      msg = new ImageMessage(this.chat, this.message.text, file);
    }

    if (contentType == "videoMessage") {
      msg = new VideoMessage(this.chat, this.message.text, file);
    }

    if (contentType == "audioMessage") {
      msg = new AudioMessage(this.chat, file);
    }

    if (contentType == "stickerMessage") {
      msg = new StickerMessage(this.chat, file);

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

    if (content.gifPlayback) {
      msg.isGIF = true;
    }

    if (!!content.mimetype) {
      msg.mimetype = content.mimetype;
    }

    if (!!content.fileName) {
      msg.name = content.fileName;
    }

    this.message = msg;
  }

  /**
   * * Converte uma mensagem de reação
   * @param content
   */
  public convertReactionMessage(content: any) {
    this.message = new ReactionMessage(this.chat, content.text, content.key.id);
  }

  /**
   * * Converte uma mensagem editada
   * @param content
   */
  public async convertEditedMessage(content: WAMessageContent["editedMessage"]["message"]) {
    this.set({ ...content, message: content.editedMessage } as any, this.type);

    await this.get();

    this.message.isEdited = true;
  }

  /**
   * * Converte uma mensagem de enquete
   * @param content
   */
  public convertPollCreationMessage(content: proto.Message.PollCreationMessage) {
    const pollCreation = this.bot.polls[this.chat.id];

    const pollMessage = new PollMessage(this.chat, content.name);

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
    const pollCreation = this.bot.polls[content.pollCreationMessageKey.id];
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

      this.bot.polls[pollCreation.id] = pollCreation;

      await this.bot.savePolls(this.bot.polls);
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

    this.message = listMSG;
  }
}
