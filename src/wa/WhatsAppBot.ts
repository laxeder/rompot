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
} from "@whiskeysockets/baileys";
import internal from "stream";
import pino from "pino";

import { getBaileysAuth, MultiFileAuthState } from "@wa/Auth";
import ConfigWAEvents from "@wa/ConfigWAEvents";
import { getID, replaceID } from "@wa/ID";
import { WAStatus } from "@wa/WAStatus";

import { getImageURL, getRompotVersion, injectJSON } from "@utils/Generic";
import WaitCallBack from "@utils/WaitCallBack";
import { BotStatus } from "../bot/BotStatus";
import BotEvents from "../bot/BotEvents";
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
  public auth: IAuth = new MultiFileAuthState("./session", false);

  public configEvents: ConfigWAEvents = new ConfigWAEvents(this);
  public wcb: WaitCallBack = new WaitCallBack((err: any) => this.ev.emit("error", err));
  public chatWCB: WaitCallBack = new WaitCallBack((err: any) => {});
  public msgWCB: WaitCallBack = new WaitCallBack((err: any) => this.ev.emit("error", err));

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

      await this.readChats();
      await this.readUsers();
      await this.readPolls();
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

        await this.readChats();
        await this.readUsers();
        await this.readPolls();
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

  //! ********************************* AUTH *********************************

  /**
   * * Obtem os chats salvos
   */
  // public async readChats() {
  //   const chats: Chat = (await this.auth.get(`chats`)) || {};

  //   for (const id of Object.keys(chats || {})) {
  //     const chat = chats[id];

  //     if (!!!chat) continue;

  //     this.chats[id] = injectJSON(chat, new Chat(chat.id));

  //     for (const userId of Object.keys(chat.users || {})) {
  //       const user = chat.users[userId];

  //       if (!!!user) continue;

  //       this.chats[id].users[userId] = injectJSON(user, new User(user.id));
  //     }
  //   }

  //   this.chats[this.id] = new Chat(this.id, "pv", this.sock.user.name || this.sock.user.notify || this.sock.user.verifiedName || "");
  // }

  // /**
  //  * * Obtem os usuários salvos
  //  */
  // public async readUsers() {
  //   const users: Record<string, User> = (await this.auth.get(`users`)) || {};

  //   for (const id of Object.keys(users || {})) {
  //     const user = users[id];

  //     if (!!!user) continue;

  //     this.users[id] = injectJSON(user, new User(user.id));
  //   }

  //   this.users[this.id] = new User(this.id, this.sock.user.name || this.sock.user.notify || this.sock.user.verifiedName || "");
  // }

  // /**
  //  * * Obtem as mensagem de enquete salvas
  //  */
  // public async readPolls() {
  //   const polls: { [id: string]: PollMessage } = (await this.auth.get(`polls`)) || {};

  //   for (const id of Object.keys(polls || {})) {
  //     const poll = polls[id];

  //     if (!!!poll) continue;

  //     this.polls[id] = PollMessage.fromJSON(poll);
  //   }
  // }

  /**
   * * Lê o chat
   * @param chat Sala de bate-papo
   */
  public async readChat(chat: any) {
    chat.id = replaceID(chat.id || chat.newJID);

    const newChat = this.chats[chat.id] || new Chat(chat.id);

    if (newChat.id.includes("@l")) return newChat;

    if (newChat.id.includes("@g")) {
      const metadata = await this.chatWCB.waitCall(() => this.sock?.groupMetadata(getID(newChat.id)));

      if (!metadata || !metadata?.participants) return newChat;

      for (const p of metadata?.participants || []) {
        const user = this.users[replaceID(p.id)] || new User(replaceID(p.id));

        user.isChatAdmin = p.admin == "admin" || p.isAdmin || p.isSuperAdmin || false;
        user.isChatLeader = p.admin == "superadmin" || p.isSuperAdmin || false;

        newChat.users[user.id] = user;
      }

      newChat.type = "group";
      newChat.name = metadata?.subject || newChat.name || "";
      newChat.description = metadata?.desc || newChat.description || "";
    } else {
      newChat.name = chat?.subject || chat?.name || chat?.verifiedName || chat?.notify || newChat.name || "";
      newChat.description = chat?.desc || chat.description || newChat.description || "";
    }

    await this.addChat(newChat);

    return newChat;
  }

  /**
   * * Lê o usuário
   * @param user Usuário
   * @param save Salva usuário lido
   */
  public async readUser(user: any) {
    user.id = replaceID(user?.id || user?.newJID || `${user}` || "");

    const newUser = new User(user.id, user?.name || user?.verifiedName || user?.notify || "");

    await this.addUser(newUser);

    return newUser;
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

    const chat = this.chats[replaceID(chatId)] || new Chat(replaceID(chatId), chatId.includes("@g") ? "group" : "pv");
    const fromUser = this.users[replaceID(fromId)] || new User(replaceID(fromId));
    const user = this.users[replaceID(userId)] || new User(replaceID(userId));

    if (!this.chats.hasOwnProperty(chat.id)) this.chats[chat.id] = chat;

    if (!this.chats[chat.id]?.users?.hasOwnProperty(user.id)) {
      this.chats[chat.id].users[user.id] = user;
    }

    if (event == "add") this.chats[chat.id].users[user.id] = user;
    if (event == "promote") this.chats[chat.id].users[user.id].isChatAdmin = true;
    if (event == "demote") this.chats[chat.id].users[user.id].isChatAdmin = false;
    if (event == "remove") delete this.chats[chat.id].users[user.id];

    if (user.id == this.id) {
      if (event == "remove") await this.removeChat(chat);
      if (event == "add") await this.addChat(chat);
    } else {
      await this.saveChats();
    }

    this.ev.emit("user", { action, event, user, fromUser, chat });
  }

  //! ********************************* CHAT *********************************

  public async getChatName(chat: Chat) {
    return this.chats[replaceID(chat.id)]?.name || "";
  }

  public async setChatName(chat: Chat, name: string) {
    if (!chat.id.includes("@g")) return;

    const admins = await this.getChatAdmins(chat);

    if (!admins.hasOwnProperty(this.id)) return;

    return this.wcb.waitCall(() => this.sock.groupUpdateSubject(getID(chat.id), name));
  }

  public async getChatDescription(chat: Chat) {
    return this.chats[replaceID(chat.id)]?.description || "";
  }

  public async setChatDescription(chat: Chat, description: string): Promise<any> {
    if (!chat.id.includes("@g")) return;

    const admins = await this.getChatAdmins(chat);

    if (!admins.hasOwnProperty(this.id)) return;

    return this.wcb.waitCall(() => this.sock.groupUpdateDescription(getID(chat.id), description));
  }

  public async getChatProfile(chat: Chat) {
    const uri = await this.chatWCB.waitCall(() => this.sock.profilePictureUrl(getID(chat.id), "image"));

    return await getImageURL(uri);
  }

  public async setChatProfile(chat: Chat, image: Buffer) {
    if (!chat.id.includes("@g")) return;

    const admins = await this.getChatAdmins(chat);

    if (!admins.hasOwnProperty(this.id)) return;

    return this.wcb.waitCall(() => this.sock.updateProfilePicture(getID(chat.id), image));
  }

  public async addChat(chat: Chat) {
    await this.setChat(chat);

    this.ev.emit("chat", { action: "add", chat: this.chats[replaceID(chat.id)] || chat });
  }

  public async removeChat(chat: Chat) {
    delete this.chats[chat.id];

    this.ev.emit("chat", { action: "remove", chat });

    this.saveChats();
  }

  public async getChat(chat: Chat): Promise<Chat | null> {
    const userData = await this.auth.get(`chats-${chat.id}`);

    if (!userData) return null;

    return injectJSON(userData, new Chat(""));
  }

  public async setChat(chat: Chat) {
    if (chat.id.includes("status")) return;

    chat.id = replaceID(chat.id);
    chat.type = Chat.getChatType(chat.id);

    await this.auth.set(`chats-${chat.id}`, chat);
  }

  public async getChats(): Promise<Record<string, Chat>> {
    const ids = await this.auth.listAll("chats-");

    const chats: Record<string, Chat> = {};

    await Promise.all(
      ids.map(async (id) => {
        const chat = await this.getChat(ChatUtils.get(id));

        if (chat == null) return;

        chats[id] = chat;
      })
    );

    return chats;
  }

  public async setChats(chats: Record<string, Chat>) {
    await Promise.all(Object.values(chats).map(async (chat) => this.setChat(chat)));
  }

  public async getChatUsers(chat: Chat): Promise<Record<string, User>> {
    const chatData = await this.getChat(chat);

    if (!chatData) return {};

    return chatData?.users || {};
  }

  public async getChatAdmins(chat: Chat): Promise<Record<string, User>> {
    const users: Record<string, User> = {};

    if (!this.chats.hasOwnProperty(chat.id)) return users;

    for (const id in this.chats[chat.id].users) {
      const user = this.chats[chat.id].users[id];

      if (user.isChatAdmin || user.isChatLeader) {
        users[id] = user;
      }
    }

    return users;
  }

  public async getChatLeader(chat: Chat): Promise<User> {
    let user: User = new User("");

    if (!this.chats.hasOwnProperty(chat.id)) return user;

    for (const id in this.chats[chat.id].users) {
      if (this.chats[chat.id].users[id].isChatLeader) {
        user = this.chats[chat.id].users[id];
      }
    }

    return user;
  }

  public async addUserInChat(chat: Chat, user: User) {
    if (!chat.id.includes("@g")) return;

    const admins = await this.getChatAdmins(chat);

    if (!admins.hasOwnProperty(this.id)) return;

    await this.wcb.waitCall(() => this.sock?.groupParticipantsUpdate(getID(chat.id), [getID(user.id)], "add"));
  }

  public async removeUserInChat(chat: Chat, user: User) {
    if (!chat.id.includes("@g")) return;

    const admins = await this.getChatAdmins(chat);

    if (!admins.hasOwnProperty(this.id)) return;

    await this.wcb.waitCall(() => this.sock?.groupParticipantsUpdate(getID(chat.id), [getID(user.id)], "remove"));
  }

  public async promoteUserInChat(chat: Chat, user: User): Promise<void> {
    if (!chat.id.includes("@g")) return;

    const admins = await this.getChatAdmins(chat);

    if (!admins.hasOwnProperty(this.id)) return;

    await this.wcb.waitCall(() => this.sock?.groupParticipantsUpdate(getID(chat.id), [getID(user.id)], "promote"));
  }

  public async demoteUserInChat(chat: Chat, user: User): Promise<void> {
    if (!chat.id.includes("@g")) return;

    const admins = await this.getChatAdmins(chat);

    if (!admins.hasOwnProperty(this.id)) return;

    await this.wcb.waitCall(() => this.sock?.groupParticipantsUpdate(getID(chat.id), [getID(user.id)], "demote"));
  }

  public async changeChatStatus(chat: Chat, status: ChatStatus): Promise<void> {
    await this.wcb.waitCall(() => this.sock.sendPresenceUpdate(WAStatus[status] || "available", getID(chat.id)));
  }

  public async createChat(chat: Chat) {
    await this.wcb.waitCall(() => this.sock.groupCreate(chat.name || "", [getID(this.id)]));
  }

  public async leaveChat(chat: Chat): Promise<void> {
    if (!chat.id.includes("@g")) return;

    if (!this.chats.hasOwnProperty(replaceID(chat.id))) return;

    const admins = await this.getChatAdmins(chat);

    if (!admins.hasOwnProperty(this.id)) return;

    await this.wcb.waitCall(() => this.sock.groupLeave(getID(chat.id)));

    await this.removeChat(chat);
  }

  //! ******************************* USER *******************************

  public async getUserName(user: User): Promise<string> {
    return (await this.getUser(user))?.name || "";
  }

  public async setUserName(user: User, name: string): Promise<void> {
    if (replaceID(user.id) != this.id) return;

    await this.setBotName(name);
  }

  public async getUserDescription(user: User): Promise<string> {
    return this.chatWCB.waitCall(async () => (await this.sock.fetchStatus(String(getID(user.id))))?.status || "");
  }

  public async setUserDescription(user: User, description: string): Promise<void> {
    if (replaceID(user.id) != this.id) return;

    await this.setBotDescription(description);
  }

  public async getUserProfile(user: User, lowQuality?: boolean) {
    const uri = await this.chatWCB.waitCall(() => this.sock.profilePictureUrl(getID(user.id), !!lowQuality ? "preview" : "image"));

    return await getImageURL(uri);
  }

  public async setUserProfile(user: User, image: Buffer) {
    if (getID(user.id) != this.id) return;

    return this.setBotProfile(image);
  }

  public async getUser(user: User): Promise<User | null> {
    let usr: User | User | Chat = this.chats[replaceID(user.id)] || this.users[replaceID(user.id)];

    if (!usr) return null;

    return injectJSON(usr, new User(replaceID(user.id)));
  }

  public async setUser(user: User): Promise<void> {
    this.users[replaceID(user.id)] = injectJSON(user, new User(replaceID(user.id)));

    await this.saveUsers();
  }

  public async getUsers(): Promise<Record<string, User>> {
    return this.users;
  }

  public async setUsers(users: Record<string, User>): Promise<void> {
    await Promise.all(Object.keys(users).map(async (id) => await this.setUser(users[id])));
  }

  public async addUser(user: User) {
    await this.setUser(user);
  }

  public async removeUser(user: User) {
    delete this.chats[user.id];
  }

  public async blockUser(user: User) {
    if (replaceID(user.id) == this.id) return;

    await this.wcb.waitCall(() => this.sock?.updateBlockStatus(getID(user.id), "block"));
  }

  public async unblockUser(user: User) {
    if (replaceID(user.id) == this.id) return;

    await this.wcb.waitCall(() => this.sock?.updateBlockStatus(getID(user.id), "unblock"));
  }

  //! ******************************** BOT ********************************

  public async getBotName() {
    return this.getUserName(UserUtils.get(this.id));
  }

  public async setBotName(name: string) {
    return this.wcb.waitCall(() => this.sock.updateProfileName(name));
  }

  public async getBotDescription() {
    return this.getUserDescription(UserUtils.get(this.id));
  }

  public async setBotDescription(description: string) {
    return this.wcb.waitCall(() => this.sock.updateProfileStatus(description));
  }

  public async getBotProfile() {
    return this.getUserProfile(UserUtils.get(this.id));
  }

  public async setBotProfile(image: Buffer) {
    return this.wcb.waitCall(() => this.sock.updateProfilePicture(getID(this.id), image));
  }

  //! ******************************* MESSAGE *******************************

  public async readMessage(message: IMessage): Promise<void> {
    const key: proto.MessageKey = {
      remoteJid: getID(message.chat.id),
      id: message.id || "",
      fromMe: message.fromMe || message.user.id == this.id,
      participant: message.chat.id.includes("@g") ? getID(message.user.id || this.id) : undefined,
      toJSON: () => key,
    };

    return await this.msgWCB.waitCall(() => this.sock.readMessages([key]));
  }

  public async removeMessage(message: IMessage) {
    return await this.msgWCB.waitCall(() =>
      this.sock?.chatModify(
        {
          clear: { messages: [{ id: message.id || "", fromMe: message.user.id == this.id, timestamp: Number(message.timestamp || Date.now()) }] },
        },
        getID(message.chat.id)
      )
    );
  }

  public async deleteMessage(message: IMessage) {
    const key: any = { remoteJid: getID(message.chat.id), id: message.id };

    if (message.chat.id.includes("@g")) {
      if (message.user.id != this.id && !(await this.getChatAdmins(message.chat)).hasOwnProperty(this.id)) return;

      key.participant = getID(message.user.id);
    }

    await this.msgWCB.waitCall(() => this.sock?.sendMessage(getID(message.chat.id), { delete: key }));
  }

  public async addReaction(message: IReactionMessage): Promise<void> {
    await this.send(message);
  }

  public async removeReaction(message: IReactionMessage): Promise<void> {
    await this.send(message);
  }

  public async editMessage(message: IMessage): Promise<void> {
    await this.send(message);
  }

  public async send(content: IMessage): Promise<IMessage> {
    const waMSG = new WhatsAppMessage(this, content);
    await waMSG.refactory(content);

    if (waMSG.isRelay) {
      const id = await this.msgWCB.waitCall(() => this.sock?.relayMessage(waMSG.chat, waMSG.message, { ...waMSG.options, messageId: waMSG.chat })).catch((err) => this.ev.emit("error", err));

      if (!!id && typeof id == "string") content.id = id;

      return content;
    }

    const sendedMessage = await this.msgWCB.waitCall(() => this.sock?.sendMessage(waMSG.chat, waMSG.message, waMSG.options)).catch((err) => this.ev.emit("error", err));

    if (typeof sendedMessage == "boolean") return content;

    const msgRes = (await new WhatsAppConvertMessage(this, sendedMessage).get()) || content;

    if (isPollMessage(msgRes) && isPollMessage(content)) {
      msgRes.options = content.options;
      msgRes.secretKey = sendedMessage.message.messageContextInfo.messageSecret;

      this.polls[msgRes.id] = msgRes;

      await this.savePolls(this.polls);
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

  //! ******************************** OUTROS *******************************

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
    const user = await this.wcb.waitCall(() => this.sock?.onWhatsApp(getID(id)));

    if (user && user.length > 0) return { exists: user[0].exists, id: replaceID(user[0].jid) };

    return { exists: false, id: replaceID(id) };
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
   * @param name Nome da plataforma
   * @param browser Nome do navegador
   * @param version Versão do navegador
   */
  public static Browser(name: string = "Rompot", browser: string = "Chrome", version: string = getRompotVersion()) {
    return [name, browser, version] as [string, string, string];
  }
}
