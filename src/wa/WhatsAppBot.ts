import makeWASocket, {
  DisconnectReason,
  downloadMediaMessage,
  proto,
  MediaDownloadOptions,
  WASocket,
  SocketConfig,
  makeInMemoryStore,
  AuthenticationCreds,
  WAConnectionState,
  ConnectionState,
  isJidGroup,
  Browsers,
  generateWAMessageFromContent,
  GroupMetadata,
} from "@whiskeysockets/baileys";
import * as baileys from "@whiskeysockets/baileys";
import internal from "stream";
import pino from "pino";

import { PollMessage, PollUpdateMessage, ReactionMessage } from "../messages";
import { getBaileysAuth, MultiFileAuthState } from "./Auth";
import Message, { MessageType } from "../messages/Message";
import { ConvertToWAMessage } from "./ConvertToWAMessage";
import FunctionHandler from "../utils/FunctionHandler";
import { ConvertWAMessage } from "./ConvertWAMessage";
import { Media } from "../messages/MediaMessage";
import { UserAction, UserEvent } from "../user";
import { getImageURL } from "../utils/Generic";
import ConfigWAEvents from "./ConfigWAEvents";
import { BotStatus } from "../bot/BotStatus";
import { ChatType } from "../chat/ChatType";
import BotEvents from "../bot/BotEvents";
import { getPhoneNumber } from "./ID";
import { WAStatus } from "./WAStatus";
import { ChatStatus } from "../chat";
import IAuth from "../client/IAuth";
import User from "../user/User";
import Chat from "../chat/Chat";
import IBot from "../bot/IBot";

export default class WhatsAppBot extends BotEvents implements IBot {
  //@ts-ignore
  public sock: WASocket = {};
  public config: Partial<SocketConfig & { usePairingCode: boolean }>;
  public store: ReturnType<typeof makeInMemoryStore>;
  public saveCreds = (creds: Partial<AuthenticationCreds>) => new Promise<void>((res) => res);
  public connectionListeners: ((update: Partial<ConnectionState>) => boolean)[] = [];

  public DisconnectReason = DisconnectReason;
  public logger: any = pino({ level: "silent" });

  public id: string = "";
  public status: BotStatus = BotStatus.Offline;
  public phoneNumber: number = 0;
  public name: string = "";
  public profileUrl: string = "";
  public auth: IAuth = new MultiFileAuthState("./session", false);

  public configEvents: ConfigWAEvents = new ConfigWAEvents(this);
  public funcHandler = new FunctionHandler({ sock: [], chat: [], user: [], msg: [] });

  constructor(config?: Partial<SocketConfig & { usePairingCode: boolean }>) {
    super();

    this.config = {
      printQRInTerminal: true,
      logger: this.logger,
      defaultQueryTimeoutMs: 10000,
      browser: WhatsAppBot.Browser(),
      async getMessage(key) {
        return (await this.store.loadMessage(key.remoteJid!, key.id!))?.message || undefined;
      },
      async patchMessageBeforeSending(msg) {
        if (msg.deviceSentMessage?.message?.listMessage?.listType == proto.Message.ListMessage.ListType.PRODUCT_LIST) {
          msg = JSON.parse(JSON.stringify(msg));

          msg.deviceSentMessage.message.listMessage.listType = proto.Message.ListMessage.ListType.SINGLE_SELECT;
        }

        if (msg.listMessage?.listType == proto.Message.ListMessage.ListType.PRODUCT_LIST) {
          msg = JSON.parse(JSON.stringify(msg));

          msg.listMessage.listType = proto.Message.ListMessage.ListType.SINGLE_SELECT;
        }

        return msg;
      },
      ...config,
    };

    this.store = makeInMemoryStore({ logger: this.config.logger });
  }

  public async connect(auth?: string | IAuth): Promise<void> {
    try {
      if (!!!auth || typeof auth == "string") {
        this.auth = new MultiFileAuthState(`${auth || "./session"}`);
      } else {
        this.auth = auth;
      }

      await this.internalConnect();

      await this.awaitConnectionState("open");
    } catch (err) {
      this.ev.emit("error", err);
    }
  }

  public async connectByCode(phoneNumber: string, auth: string | IAuth): Promise<string> {
    return new Promise(async (res) => {
      try {
        if (!!!auth || typeof auth == "string") {
          this.auth = new MultiFileAuthState(`${auth || "./session"}`);
        } else {
          this.auth = auth;
        }

        this.config.printQRInTerminal = false;

        await this.internalConnect();

        if (!this.sock.authState.creds.account) {
          await this.sock.waitForConnectionUpdate((update) => !!update.qr);

          const code = await this.sock.requestPairingCode(phoneNumber);

          res(code);
        } else {
          res("");
        }

        await this.awaitConnectionState("open");
      } catch (err) {
        this.ev.emit("error", err);
      }
    });
  }

  public async internalConnect(): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const { state, saveCreds } = await getBaileysAuth(this.auth);

        this.saveCreds = saveCreds;

        this.sock = makeWASocket({
          auth: state,
          ...this.config,
        });

        this.store.bind(this.sock.ev);

        this.configEvents.configureAll();

        resolve();

        await this.awaitConnectionState("open");

        this.sock.ev.on("creds.update", saveCreds);
      } catch (err) {
        this.ev.emit("error", err);
      }
    });
  }

  /**
   * * Reconecta ao servidor do WhatsApp
   * @param alert Avisa que está econectando
   * @returns
   */
  public async reconnect(alert: boolean = true): Promise<any> {
    if (alert) this.ev.emit("reconnecting", {});

    await this.stop();

    await this.internalConnect();
  }

  /**
   * * Desliga a conexão com o servidor do WhatsApp
   * @param reason
   * @returns
   */
  public async stop(reason: any = DisconnectReason.loggedOut): Promise<void> {
    try {
      this.status = BotStatus.Offline;

      this.sock?.end(reason);
    } catch (err) {
      this.emit("error", err);
    }
  }

  public async logout(): Promise<void> {
    await this.sock?.logout();
  }

  /**
   * * Aguarda um status de conexão
   */
  public async awaitConnectionState(connection: WAConnectionState): Promise<Partial<ConnectionState>> {
    return new Promise<Partial<ConnectionState>>((res) => {
      this.connectionListeners.push((update: Partial<ConnectionState>) => {
        if (update.connection != connection) return false;

        res(update);

        return true;
      });
    });
  }

  /**
   * * Lê o chat
   * @param chat Sala de bate-papo
   */
  public async readChat(chat: Chat, metadata?: Partial<GroupMetadata> & Partial<baileys.Chat>) {
    try {
      if (chat.id.includes("@l")) return chat;

      chat.id = chat.id;
      chat.phoneNumber = getPhoneNumber(chat.id);
      chat.type = isJidGroup(chat.id) ? ChatType.Group : ChatType.PV;

      if (chat.type == ChatType.Group) {
        if (!metadata) {
          metadata = await this.funcHandler.exec("chat", this.sock.groupMetadata, chat.id);
        } else if (!metadata.participants) {
          metadata = { ...metadata, ...(await this.funcHandler.exec("chat", this.sock.groupMetadata, chat.id)) };
        }

        if (!metadata || !metadata?.participants) return chat;

        for (const p of metadata?.participants || []) {
          chat.users.push(p.id);

          if (p.admin == "admin" || p.isAdmin || p.isSuperAdmin) {
            chat.admins.push(p.id);
          }
        }

        chat.leader = metadata?.subjectOwner || "";
      }

      chat.name = metadata?.subject || metadata?.name || chat.name || "";
      chat.description = metadata?.desc || metadata?.description || chat.description || "";
      chat.profileUrl = chat.profileUrl || (await this.getChatProfileUrl(chat)) || "";

      await this.addChat(chat);
    } catch (err) {
      this.emit("error", err);
    }

    return chat;
  }

  /**
   * Obtem uma mensagem de enquete.
   * @param pollMessageId - ID da mensagem de enquete que será obtida.
   * @returns A mensagem de enquete salva.
   */
  public async getPollMessage(pollMessageId: string): Promise<PollMessage | PollUpdateMessage> {
    const pollMessage = await this.auth.get(`polls-${pollMessageId}`);

    if (!pollMessage || !PollMessage.isValid(pollMessage)) return PollMessage.fromJSON({ id: pollMessageId });

    if (pollMessage.type == MessageType.PollUpdate) {
      return PollUpdateMessage.fromJSON(pollMessage);
    }

    return PollMessage.fromJSON(pollMessage);
  }

  /**
   * Salva a mensagem de enquete.
   * @param pollMessage - Mensagem de enquete que será salva.
   */
  public async savePollMessage(pollMessage: PollMessage | PollUpdateMessage): Promise<void> {
    await this.auth.set(`polls-${pollMessage.id}`, pollMessage.toJSON());
  }

  /**
   * * Trata atualizações de participantes
   * @param action Ação realizada
   * @param chatId Sala de bate-papo que a ação foi realizada
   * @param userId Usuário que foi destinado a ação
   * @param fromId Usuário que realizou a ação
   */
  public async groupParticipantsUpdate(action: UserAction, chatId: string, userId: string, fromId: string) {
    const event: UserEvent = action == "join" ? "add" : action == "leave" ? "remove" : action;

    const chat = (await this.getChat(new Chat(chatId))) || Chat.fromJSON({ id: chatId, phoneNumber: getPhoneNumber(chatId), type: ChatType.Group });
    const fromUser = (await this.getUser(new User(fromId))) || User.fromJSON({ id: fromId, phoneNumber: getPhoneNumber(fromId) });
    const user = (await this.getUser(new User(userId))) || User.fromJSON({ id: userId, phoneNumber: getPhoneNumber(userId) });

    if (event == "add") chat.users.push(user.id);
    if (event == "remove") chat.users = chat.users.filter((u) => u != user.id);
    if (event == "demote") chat.admins = chat.admins.filter((admin) => admin != user.id);
    if (event == "promote") chat.admins.push(user.id);

    if (user.id == this.id) {
      if (event == "remove") await this.removeChat(chat);
      if (event == "add") await this.addChat(chat);
    } else {
      await this.setChat(chat);
    }

    this.ev.emit("user", { action, event, user, fromUser, chat });
  }

  //! ********************************* CHAT *********************************

  public async getChatName(chat: Chat) {
    return (await this.getChat(chat))?.name || "";
  }

  public async setChatName(chat: Chat, name: string) {
    if (!isJidGroup(chat.id)) return;

    if (!(await this.getChatAdmins(chat)).includes(this.id)) return;

    await this.funcHandler.exec("chat", this.sock.groupUpdateSubject, chat.id, name);
  }

  public async getChatDescription(chat: Chat) {
    return (await this.getChat(chat))?.description || "";
  }

  public async setChatDescription(chat: Chat, description: string): Promise<any> {
    if (!isJidGroup(chat.id)) return;

    if (!(await this.getChatAdmins(chat)).includes(this.id)) return;

    await this.funcHandler.exec("chat", this.sock.groupUpdateDescription, chat.id, description);
  }

  public async getChatProfile(chat: Chat, lowQuality?: boolean) {
    const uri = await this.funcHandler.exec("chat", this.sock.profilePictureUrl, chat.id, !!lowQuality ? "preview" : "image");

    return await getImageURL(uri);
  }

  public async getChatProfileUrl(chat: Chat, lowQuality?: boolean) {
    return (await this.funcHandler.exec("chat", this.sock.profilePictureUrl, chat.id, !!lowQuality ? "preview" : "image")) || "";
  }

  public async setChatProfile(chat: Chat, image: Buffer) {
    if (!isJidGroup(chat.id)) return;

    if (!(await this.getChatAdmins(chat)).includes(this.id)) return;

    await this.funcHandler.exec("chat", this.sock.updateProfilePicture, chat.id, image);
  }

  public async addChat(chat: Chat) {
    await this.setChat(chat);

    this.ev.emit("chat", { action: "add", chat: (await this.getChat(chat)) || chat });
  }

  public async removeChat(chat: Chat): Promise<void> {
    await this.auth.remove(`chats-${chat.id}`);

    this.ev.emit("chat", { action: "remove", chat });
  }

  public async getChat(chat: Chat): Promise<Chat | null> {
    const userData = await this.auth.get(`chats-${chat.id}`);

    if (!userData) return null;

    return Chat.fromJSON(userData);
  }

  public async setChat(chat: Chat) {
    if (chat.id.includes("status")) return;
    if (chat.id.includes(":")) return;
    if (chat.id.includes("_")) return;

    chat.phoneNumber = isJidGroup(chat.id) ? 0 : getPhoneNumber(chat.id);
    chat.type = isJidGroup(chat.id) ? ChatType.Group : ChatType.PV;

    await this.auth.set(`chats-${chat.id}`, chat.toJSON());
  }

  public async getChats(): Promise<string[]> {
    return (await this.auth.listAll("chats-")).map((id) => id.replace("chats-", ""));
  }

  public async setChats(chats: Chat[]): Promise<void> {
    await Promise.all(chats.map(async (chat) => await this.setChat(chat)));
  }

  public async getChatUsers(chat: Chat): Promise<string[]> {
    return (await this.getChat(chat))?.users || [];
  }

  public async getChatAdmins(chat: Chat): Promise<string[]> {
    return (await this.getChat(chat))?.admins || [];
  }

  public async getChatLeader(chat: Chat): Promise<string> {
    return (await this.getChat(chat))?.leader || "";
  }

  public async addUserInChat(chat: Chat, user: User) {
    if (!isJidGroup(chat.id)) return;

    if (!(await this.getChatAdmins(chat)).includes(this.id)) return;

    await this.funcHandler.exec("chat", this.sock.groupParticipantsUpdate, chat.id, [user.id], "add");
  }

  public async removeUserInChat(chat: Chat, user: User) {
    if (!isJidGroup(chat.id)) return;

    if (!(await this.getChatAdmins(chat)).includes(this.id)) return;

    await this.funcHandler.exec("chat", this.sock.groupParticipantsUpdate, chat.id, [user.id], "remove");
  }

  public async promoteUserInChat(chat: Chat, user: User): Promise<void> {
    if (!isJidGroup(chat.id)) return;

    if (!(await this.getChatAdmins(chat)).includes(this.id)) return;

    await this.funcHandler.exec("chat", this.sock.groupParticipantsUpdate, chat.id, [user.id], "promote");
  }

  public async demoteUserInChat(chat: Chat, user: User): Promise<void> {
    if (!isJidGroup(chat.id)) return;

    if (!(await this.getChatAdmins(chat)).includes(this.id)) return;

    await this.funcHandler.exec("chat", this.sock.groupParticipantsUpdate, chat.id, [user.id], "demote");
  }

  public async changeChatStatus(chat: Chat, status: ChatStatus): Promise<void> {
    await this.funcHandler.exec("chat", this.sock.sendPresenceUpdate, WAStatus[status] || "available", chat.id);
  }

  public async createChat(chat: Chat) {
    await this.funcHandler.exec("chat", this.sock.groupCreate, chat.name || "", [this.id]);
  }

  public async leaveChat(chat: Chat): Promise<void> {
    if (!isJidGroup(chat.id)) return;

    if ((await this.getChat(chat)) == null) return;

    await this.funcHandler.exec("chat", this.sock.groupLeave, chat.id);

    await this.removeChat(chat);
  }

  public async joinChat(code: string): Promise<void> {
    await this.funcHandler.exec("chat", this.sock.groupAcceptInvite, code.replace("https://chat.whatsapp.com/", ""));
  }

  public async getChatEnvite(chat: Chat): Promise<string> {
    if (!isJidGroup(chat.id)) return "";
    if (!(await this.getChatAdmins(chat)).includes(this.id)) return "";

    return await this.funcHandler.exec("chat", this.sock.groupInviteCode, chat.id);
  }

  public async revokeChatEnvite(chat: Chat): Promise<string> {
    if (!isJidGroup(chat.id)) return "";
    if (!(await this.getChatAdmins(chat)).includes(this.id)) return "";

    return await this.funcHandler.exec("chat", this.sock.groupRevokeInvite, chat.id);
  }

  public async getUserName(user: User): Promise<string> {
    return (await this.getUser(user))?.name || "";
  }

  public async setUserName(user: User, name: string): Promise<void> {
    if (user.id != this.id) return;

    await this.setBotName(name);
  }

  public async getUserDescription(user: User): Promise<string> {
    return (await this.funcHandler.exec("user", this.sock.fetchStatus, String(user.id)))?.status || "";
  }

  public async setUserDescription(user: User, description: string): Promise<void> {
    if (user.id != this.id) return;

    await this.setBotDescription(description);
  }

  public async getUserProfile(user: User, lowQuality?: boolean) {
    const uri = await this.funcHandler.exec("user", this.sock.profilePictureUrl, user.id, !!lowQuality ? "preview" : "image");

    return await getImageURL(uri);
  }

  public async getUserProfileUrl(user: User, lowQuality?: boolean) {
    return (await this.funcHandler.exec("user", this.sock.profilePictureUrl, user.id, !!lowQuality ? "preview" : "image")) || "";
  }

  public async setUserProfile(user: User, image: Buffer) {
    if (user.id != this.id) return;

    await this.setBotProfile(image);
  }

  public async getUser(user: User): Promise<User | null> {
    const userData = await this.auth.get(`users-${user.id}`);

    if (!userData) return null;

    return User.fromJSON(userData);
  }

  public async setUser(user: User): Promise<void> {
    user.phoneNumber = getPhoneNumber(user.id);

    await this.auth.set(`users-${user.id}`, user.toJSON());
  }

  public async getUsers(): Promise<string[]> {
    return (await this.auth.listAll("users-")).map((id) => id.replace("users-", ""));
  }

  public async setUsers(users: User[]): Promise<void> {
    await Promise.all(users.map(async (user) => await this.setUser(user)));
  }

  public async addUser(user: User) {
    await this.setUser(user);
  }

  public async removeUser(user: User): Promise<void> {
    await this.auth.remove(`users-${user.id}`);
  }

  public async blockUser(user: User) {
    if (user.id == this.id) return;

    await this.funcHandler.exec("user", this.sock.updateBlockStatus, user.id, "block");
  }

  public async unblockUser(user: User) {
    if (user.id == this.id) return;

    await this.funcHandler.exec("user", this.sock.updateBlockStatus, user.id, "unblock");
  }

  //! ******************************** BOT ********************************

  public async getBotName() {
    return await this.getUserName(new User(this.id));
  }

  public async setBotName(name: string) {
    await this.funcHandler.exec("user", this.sock.updateProfileName, name);
  }

  public async getBotDescription() {
    return await this.getUserDescription(new User(this.id));
  }

  public async setBotDescription(description: string) {
    await this.funcHandler.exec("user", this.sock.updateProfileStatus, description);
  }

  public async getBotProfile(lowQuality?: boolean) {
    return await this.getUserProfile(new User(this.id), lowQuality);
  }

  public async getBotProfileUrl(lowQuality?: boolean) {
    return (await this.getUserProfileUrl(new User(this.id), lowQuality)) || "";
  }

  public async setBotProfile(image: Buffer) {
    await this.funcHandler.exec("user", this.sock.updateProfilePicture, this.id, image);
  }

  //! ******************************* MESSAGE *******************************

  public async readMessage(message: Message): Promise<void> {
    const key: proto.MessageKey = {
      remoteJid: message.chat.id,
      id: message.id || "",
      fromMe: message.fromMe || message.user.id == this.id,
      participant: isJidGroup(message.chat.id) ? message.user.id || this.id : undefined,
      toJSON: () => key,
    };

    return await this.funcHandler.exec("msg", this.sock.readMessages, [key]);
  }

  public async removeMessage(message: Message) {
    await this.funcHandler.exec(
      "msg",
      this.sock.chatModify,
      {
        clear: { messages: [{ id: message.id || "", fromMe: message.user.id == this.id, timestamp: Number(message.timestamp || Date.now()) }] },
      },
      message.chat.id
    );
  }

  public async deleteMessage(message: Message) {
    const key: proto.IMessageKey = {
      remoteJid: message.chat.id,
      id: message.id,
      fromMe: message.fromMe || message.user.id == this.id,
      participant: isJidGroup(message.chat.id) ? message.user.id || this.id : undefined,
    };

    if (key.participant && key.participant != this.id && !(await this.getChatAdmins(message.chat)).includes(this.id)) return;

    await this.funcHandler.exec("msg", this.sock.sendMessage, message.chat.id, { delete: key });
  }

  public async addReaction(message: ReactionMessage): Promise<void> {
    await this.send(message);
  }

  public async removeReaction(message: ReactionMessage): Promise<void> {
    await this.send(message);
  }

  public async editMessage(message: Message): Promise<void> {
    await this.send(message);
  }

  public async send(content: Message): Promise<Message> {
    const waMSG = new ConvertToWAMessage(this, content);
    await waMSG.refactory(content);

    if (waMSG.isRelay) {
      await this.funcHandler.exec("msg", this.sock.relayMessage, waMSG.chatId, waMSG.waMessage, { ...waMSG.options });

      const msgRes = generateWAMessageFromContent(waMSG.chatId, waMSG.waMessage, { ...waMSG.options, userJid: this.id });

      return await new ConvertWAMessage(this, msgRes).get();
    }

    const sendedMessage = await this.funcHandler.exec("msg", this.sock.sendMessage, waMSG.chatId, waMSG.waMessage, waMSG.options);

    if (typeof sendedMessage == "boolean") return content;

    const msgRes = (await new ConvertWAMessage(this, sendedMessage).get()) || content;

    if (PollMessage.isValid(msgRes) && PollMessage.isValid(content)) {
      msgRes.options = content.options;
      msgRes.secretKey = sendedMessage.message.messageContextInfo.messageSecret;

      await this.savePollMessage(msgRes);
    }

    return msgRes;
  }

  public async downloadStreamMessage(media: Media): Promise<Buffer> {
    const stream: any = await downloadMediaMessage(
      media.stream,
      "buffer",
      {},
      {
        logger: this.logger,
        reuploadRequest: (m: proto.IWebMessageInfo) => new Promise((resolve) => resolve(m)),
      }
    );

    if (stream instanceof internal.Transform) {
      return stream.read();
    }

    return stream;
  }

  /**
   * * Faz o download de arquivos do WhatsApp
   * @param message
   * @param type
   * @param options
   * @param ctx
   * @returns
   */
  public download(message: proto.WebMessageInfo, type: "buffer" | "stream", options: MediaDownloadOptions, ctx?: any): Promise<any> {
    return downloadMediaMessage(message, type, options, ctx);
  }

  /**
   * * Verifica se o número está registrado no WhatsApp
   * @returns
   */
  public async onExists(id: string): Promise<{ exists: boolean; id: string }> {
    const user = await this.funcHandler.exec("sock", this.sock.onWhatsApp, id);

    if (user && user.length > 0) return { exists: user[0].exists, id: user[0].jid };

    return { exists: false, id };
  }

  /**
   * * Atualiza uma mensagem de mídia
   * @param message
   * @returns
   */
  public async updateMediaMessage(message: proto.IWebMessageInfo): Promise<proto.IWebMessageInfo> {
    return await this.sock.updateMediaMessage(message);
  }

  /**
   * * Aceita o convite para um grupo
   * @param code
   * @returns
   */
  public async groupAcceptInvite(code: string): Promise<string> {
    return (await this.sock?.groupAcceptInvite(code)) || "";
  }

  /**
   * * Gera a configuração de navegador
   * @param plataform Nome da plataforma
   * @param browser Nome do navegador
   * @param version Versão do navegador
   */
  public static Browser(plataform?: string, browser?: string, version?: string): [string, string, string] {
    const browserAppropriated = Browsers.appropriate(browser);

    return [plataform || browserAppropriated[0], browser || browserAppropriated[1], version || browserAppropriated[2]];
  }
}
