import makeWASocket, { DisconnectReason, downloadMediaMessage, proto, MediaDownloadOptions, WASocket, SocketConfig, makeInMemoryStore } from "@whiskeysockets/baileys";
import { BotStatus, ChatStatus, IAuth, IBot, IChat, IMessage, IPollMessage, IReactionMessage, IUser, Media, UserAction, UserEvent } from "rompot-base";
import internal from "stream";
import pino from "pino";

import { getBaileysAuth, MultiFileAuthState } from "@wa/Auth";
import { WhatsAppConvertMessage } from "@wa/WAConvertMessage";
import { WhatsAppMessage } from "@wa/WAMessage";
import ConfigWAEvents from "@wa/ConfigWAEvents";
import { WAChat, WAUser } from "@wa/WAModules";
import { getID, replaceID } from "@wa/ID";
import { WAStatus } from "@wa/WAStatus";

import PollMessage from "@messages/PollMessage";

import { UserUtils } from "@modules/user";
import { BotEvents } from "@modules/bot";

import { getImageURL, getRompotVersion, injectJSON } from "@utils/Generic";
import WaitCallBack from "@utils/WaitCallBack";
import { isPollMessage } from "@utils/Verify";

export default class WhatsAppBot implements IBot {
  //@ts-ignore
  public sock: WASocket = {};
  public config: Partial<SocketConfig & { usePairingCode: boolean }>;
  public store: ReturnType<typeof makeInMemoryStore>;

  public DisconnectReason = DisconnectReason;
  public logger: any = pino({ level: "silent" });

  public id: string = "";
  public status: BotStatus = "offline";
  public ev: BotEvents = new BotEvents();
  public auth: IAuth = new MultiFileAuthState("./session", false);

  public connectionResolve: (() => void)[] = [];
  public configEvents: ConfigWAEvents = new ConfigWAEvents(this);
  public wcb: WaitCallBack = new WaitCallBack((err: any) => this.ev.emit("error", err));
  public chatWCB: WaitCallBack = new WaitCallBack((err: any) => {});
  public msgWCB: WaitCallBack = new WaitCallBack((err: any) => this.ev.emit("error", err));

  public chats: Record<string, WAChat> = {};
  public users: Record<string, WAUser> = {};
  public polls: { [id: string]: IPollMessage } = {};

  constructor(config?: Partial<SocketConfig & { usePairingCode: boolean }>) {
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

      await this.awaitConnectionOpen();

      await this.readChats();
      await this.readUsers();
      await this.readPolls();
    } catch (err) {
      this.ev.emit("error", err);
    }
  }

  public async connectByCode(phoneNumber: string, auth: string | IAuth): Promise<string> {
    return new Promise(async (res) => {
      await this.internalConnect();

      const code = await this.sock.requestPairingCode(phoneNumber);

      res(code);

      await this.internalConnect();

      await this.awaitConnectionOpen();

      await this.readChats();
      await this.readUsers();
      await this.readPolls();
    });
  }

  public async internalConnect(): Promise<void> {
    try {
      const { state, saveCreds } = await getBaileysAuth(this.auth);

      this.sock = makeWASocket({
        auth: state,
        ...this.config,
      });

      this.sock.ev.on("creds.update", saveCreds);

      this.store.bind(this.sock.ev);

      this.configEvents.configureAll();
    } catch (err) {
      this.ev.emit("error", err);
    }
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
    if (this.status == "online") {
      this.sock?.end(reason);
    }

    this.status = "offline";
  }

  /**
   * * Aguarda o bot ficar online
   */
  public awaitConnectionOpen(): Promise<void> {
    return new Promise<void>((res) => this.connectionResolve.push(res));
  }

  /**
   * * Resolve conexões em espera
   */
  public resolveConnectionsAwait(): void {
    for (const res of this.connectionResolve) {
      res();
    }
  }

  //! ********************************* AUTH *********************************

  /**
   * * Salva os chats salvos
   * @param chats Sala de bate-papos
   */
  public async saveChats(chats: any = this.chats) {
    await this.auth.set(`chats`, chats);
  }

  /**
   * * Salva os usuários salvos
   * @param users Usuários
   */
  public async saveUsers(users: any = this.users) {
    await this.auth.set(`users`, users);
  }

  /**
   * * Salva as mensagem de enquete salvas
   * @param polls Enquetes
   */
  public async savePolls(polls: any = this.polls) {
    await this.auth.set(`polls`, polls);
  }

  /**
   * * Obtem os chats salvos
   */
  public async readChats() {
    const chats: WAChat = (await this.auth.get(`chats`)) || {};

    for (const id of Object.keys(chats || {})) {
      const chat = chats[id];

      if (!!!chat) continue;

      this.chats[id] = injectJSON(chat, new WAChat(chat.id));

      for (const userId of Object.keys(chat.users || {})) {
        const user = chat.users[userId];

        if (!!!user) continue;

        this.chats[id].users[userId] = injectJSON(user, new WAUser(user.id));
      }
    }

    this.chats[this.id] = new WAChat(this.id, "pv", this.sock.user.name || this.sock.user.notify || this.sock.user.verifiedName || "");
  }

  /**
   * * Obtem os usuários salvos
   */
  public async readUsers() {
    const users: Record<string, WAUser> = (await this.auth.get(`users`)) || {};

    for (const id of Object.keys(users || {})) {
      const user = users[id];

      if (!!!user) continue;

      this.users[id] = injectJSON(user, new WAUser(user.id));
    }

    this.users[this.id] = new WAUser(this.id, this.sock.user.name || this.sock.user.notify || this.sock.user.verifiedName || "");
  }

  /**
   * * Obtem as mensagem de enquete salvas
   */
  public async readPolls() {
    const polls: { [id: string]: PollMessage } = (await this.auth.get(`polls`)) || {};

    for (const id of Object.keys(polls || {})) {
      const poll = polls[id];

      if (!!!poll) continue;

      this.polls[id] = PollMessage.fromJSON(poll);
    }
  }

  /**
   * * Lê o chat
   * @param chat Sala de bate-papo
   */
  public async readChat(chat: any) {
    chat.id = replaceID(chat.id || chat.newJID);

    const newChat = this.chats[chat.id] || new WAChat(chat.id);

    if (newChat.id.includes("@l")) return newChat;

    if (newChat.id.includes("@g")) {
      const metadata = await this.chatWCB.waitCall(() => this.sock?.groupMetadata(getID(newChat.id)));

      if (!metadata || !metadata?.participants) return newChat;

      for (const p of metadata?.participants || []) {
        const user = this.users[replaceID(p.id)] || new WAUser(replaceID(p.id));

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
    const newUser = new WAUser(user?.id || user?.newJID || user || "", user?.name || user?.verifiedName || user?.notify || "");

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

    const chat = this.chats[replaceID(chatId)] || new WAChat(replaceID(chatId), chatId.includes("@g") ? "group" : "pv");
    const fromUser = this.users[replaceID(fromId)] || new WAUser(replaceID(fromId));
    const user = this.users[replaceID(userId)] || new WAUser(replaceID(userId));

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

  public async getChatName(chat: IChat) {
    return this.chats[replaceID(chat.id)]?.name || "";
  }

  public async setChatName(chat: IChat, name: string) {
    if (!chat.id.includes("@g")) return;

    const admins = await this.getChatAdmins(chat);

    if (!admins.hasOwnProperty(this.id)) return;

    return this.wcb.waitCall(() => this.sock.groupUpdateSubject(getID(chat.id), name));
  }

  public async getChatDescription(chat: IChat) {
    return this.chats[replaceID(chat.id)]?.description || "";
  }

  public async setChatDescription(chat: IChat, description: string): Promise<any> {
    if (!chat.id.includes("@g")) return;

    const admins = await this.getChatAdmins(chat);

    if (!admins.hasOwnProperty(this.id)) return;

    return this.wcb.waitCall(() => this.sock.groupUpdateDescription(getID(chat.id), description));
  }

  public async getChatProfile(chat: IChat) {
    const uri = await this.chatWCB.waitCall(() => this.sock.profilePictureUrl(getID(chat.id), "image"));

    return await getImageURL(uri);
  }

  public async setChatProfile(chat: IChat, image: Buffer) {
    if (!chat.id.includes("@g")) return;

    const admins = await this.getChatAdmins(chat);

    if (!admins.hasOwnProperty(this.id)) return;

    return this.wcb.waitCall(() => this.sock.updateProfilePicture(getID(chat.id), image));
  }

  public async addChat(chat: IChat) {
    await this.setChat(chat);

    this.ev.emit("chat", { action: "add", chat: this.chats[replaceID(chat.id)] || chat });
  }

  public async removeChat(chat: IChat) {
    delete this.chats[chat.id];

    this.ev.emit("chat", { action: "remove", chat });

    this.saveChats();
  }

  public async getChat(chat: IChat): Promise<WAChat | null> {
    return this.chats[replaceID(chat.id)] || null;
  }

  public async setChat(chat: IChat) {
    if (chat.id.includes("status")) return;

    chat.id = replaceID(chat.id);
    chat.type = WAChat.getChatType(chat.id);

    this.chats[chat.id] = injectJSON(chat, new WAChat(chat.id));

    await this.saveChats();
  }

  public async getChats(): Promise<Record<string, WAChat>> {
    return this.chats;
  }

  public async setChats(chats: Record<string, WAChat>) {
    this.chats = chats;
  }

  public async getChatUsers(chat: IChat): Promise<Record<string, WAUser>> {
    const users: Record<string, WAUser> = {};

    if (!this.chats.hasOwnProperty(chat.id)) return users;

    return this.chats[chat.id].users;
  }

  public async getChatAdmins(chat: IChat): Promise<Record<string, WAUser>> {
    const users: Record<string, WAUser> = {};

    if (!this.chats.hasOwnProperty(chat.id)) return users;

    for (const id in this.chats[chat.id].users) {
      const user = this.chats[chat.id].users[id];

      if (user.isChatAdmin || user.isChatLeader) {
        users[id] = user;
      }
    }

    return users;
  }

  public async getChatLeader(chat: IChat): Promise<WAUser> {
    let user: WAUser = new WAUser("");

    if (!this.chats.hasOwnProperty(chat.id)) return user;

    for (const id in this.chats[chat.id].users) {
      if (this.chats[chat.id].users[id].isChatLeader) {
        user = this.chats[chat.id].users[id];
      }
    }

    return user;
  }

  public async addUserInChat(chat: IChat, user: IUser) {
    if (!chat.id.includes("@g")) return;

    const admins = await this.getChatAdmins(chat);

    if (!admins.hasOwnProperty(this.id)) return;

    await this.wcb.waitCall(() => this.sock?.groupParticipantsUpdate(getID(chat.id), [getID(user.id)], "add"));
  }

  public async removeUserInChat(chat: IChat, user: IUser) {
    if (!chat.id.includes("@g")) return;

    const admins = await this.getChatAdmins(chat);

    if (!admins.hasOwnProperty(this.id)) return;

    await this.wcb.waitCall(() => this.sock?.groupParticipantsUpdate(getID(chat.id), [getID(user.id)], "remove"));
  }

  public async promoteUserInChat(chat: IChat, user: IUser): Promise<void> {
    if (!chat.id.includes("@g")) return;

    const admins = await this.getChatAdmins(chat);

    if (!admins.hasOwnProperty(this.id)) return;

    await this.wcb.waitCall(() => this.sock?.groupParticipantsUpdate(getID(chat.id), [getID(user.id)], "promote"));
  }

  public async demoteUserInChat(chat: IChat, user: IUser): Promise<void> {
    if (!chat.id.includes("@g")) return;

    const admins = await this.getChatAdmins(chat);

    if (!admins.hasOwnProperty(this.id)) return;

    await this.wcb.waitCall(() => this.sock?.groupParticipantsUpdate(getID(chat.id), [getID(user.id)], "demote"));
  }

  public async changeChatStatus(chat: IChat, status: ChatStatus): Promise<void> {
    await this.wcb.waitCall(() => this.sock.sendPresenceUpdate(WAStatus[status] || "available", getID(chat.id)));
  }

  public async createChat(chat: IChat) {
    await this.wcb.waitCall(() => this.sock.groupCreate(chat.name || "", [getID(this.id)]));
  }

  public async leaveChat(chat: IChat): Promise<void> {
    if (!chat.id.includes("@g")) return;

    if (!this.chats.hasOwnProperty(replaceID(chat.id))) return;

    const admins = await this.getChatAdmins(chat);

    if (!admins.hasOwnProperty(this.id)) return;

    await this.wcb.waitCall(() => this.sock.groupLeave(getID(chat.id)));

    await this.removeChat(chat);
  }

  //! ******************************* USER *******************************

  public async getUserName(user: IUser): Promise<string> {
    return (await this.getUser(user))?.name || "";
  }

  public async setUserName(user: IUser, name: string): Promise<void> {
    if (replaceID(user.id) != this.id) return;

    await this.setBotName(name);
  }

  public async getUserDescription(user: IUser): Promise<string> {
    return this.chatWCB.waitCall(async () => (await this.sock.fetchStatus(String(getID(user.id))))?.status || "");
  }

  public async setUserDescription(user: IUser, description: string): Promise<void> {
    if (replaceID(user.id) != this.id) return;

    await this.setBotDescription(description);
  }

  public async getUserProfile(user: IUser, lowQuality?: boolean) {
    const uri = await this.chatWCB.waitCall(() => this.sock.profilePictureUrl(getID(user.id), !!lowQuality ? "preview" : "image"));

    return await getImageURL(uri);
  }

  public async setUserProfile(user: IUser, image: Buffer) {
    if (getID(user.id) != this.id) return;

    return this.setBotProfile(image);
  }

  public async getUser(user: IUser): Promise<WAUser | null> {
    let usr: IUser | WAUser | WAChat = this.chats[replaceID(user.id)] || this.users[replaceID(user.id)];

    if (!usr) return null;

    return injectJSON(usr, new WAUser(replaceID(user.id)));
  }

  public async setUser(user: IUser): Promise<void> {
    this.users[replaceID(user.id)] = injectJSON(user, new WAUser(replaceID(user.id)));

    await this.saveUsers();
  }

  public async getUsers(): Promise<Record<string, WAUser>> {
    return this.users;
  }

  public async setUsers(users: Record<string, WAUser>): Promise<void> {
    await Promise.all(Object.keys(users).map(async (id) => await this.setUser(users[id])));
  }

  public async addUser(user: IUser) {
    await this.setUser(user);
  }

  public async removeUser(user: IUser) {
    delete this.chats[user.id];
  }

  public async blockUser(user: IUser) {
    if (replaceID(user.id) == this.id) return;

    await this.wcb.waitCall(() => this.sock?.updateBlockStatus(getID(user.id), "block"));
  }

  public async unblockUser(user: IUser) {
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
