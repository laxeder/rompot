import type { ConnectionStatus } from "../types/Connection";
import type { UserAction, UserEvent } from "../types/User";
import type { ChatStatus } from "../types/Chat";
import type { Media } from "../types/Message";

import makeWASocket, { DisconnectReason, downloadMediaMessage, proto, MediaDownloadOptions, WASocket, SocketConfig } from "@whiskeysockets/baileys";
import internal from "stream";
import pino from "pino";

import { getBaileysAuth, MultiFileAuthState } from "@wa/Auth";
import { WhatsAppConvertMessage } from "@wa/WAConvertMessage";
import { WhatsAppMessage } from "@wa/WAMessage";
import ConfigWAEvents from "@wa/ConfigWAEvents";
import { WAChats, WAUsers } from "@wa/WATypes";
import { WAChat, WAUser } from "@wa/WAModules";
import { getID, replaceID } from "@wa/ID";
import { WAStatus } from "@wa/WAStatus";

import { IMessage } from "@interfaces/IMessage";
import { IChat } from "@interfaces/IChat";
import { IUser } from "@interfaces/IUser";
import { IAuth } from "@interfaces/IAuth";
import { IBot } from "@interfaces/IBot";

import ReactionMessage from "@messages/ReactionMessage";
import PollMessage from "@messages/PollMessage";
import Message from "@messages/Message";

import { getImageURL, injectJSON } from "@utils/Generic";
import { BotEvents } from "@utils/Emmiter";

import { isPollMessage } from "@utils/Message";
import WaitCallBack from "@utils/WaitCallBack";

export default class WhatsAppBot implements IBot {
  //@ts-ignore
  public sock: WASocket = {};
  public DisconnectReason = DisconnectReason;
  public users: WAUsers = {};
  public ev: BotEvents = new BotEvents();
  public status: ConnectionStatus = "offline";
  public id: string = "";
  public auth: IAuth = new MultiFileAuthState("./session", false);
  public logger: any = pino({ level: "silent" });
  public wcb: WaitCallBack = new WaitCallBack((err: any) => this.ev.emit("error", err));
  public config: Partial<SocketConfig>;
  public configEvents: ConfigWAEvents = new ConfigWAEvents(this);

  public chats: WAChats = {};
  public polls: { [id: string]: PollMessage } = {};
  public sendedMessages: { [id: string]: IMessage } = {};

  constructor(config?: Partial<SocketConfig>) {
    this.config = {
      printQRInTerminal: true,
      logger: this.logger,
      browser: WhatsAppBot.Browser(),
      ...config,
    };
  }

  public async connect(auth?: string | IAuth): Promise<void> {
    return await new Promise(async (resolve, reject) => {
      try {
        if (!!!auth) auth = String("./session");

        if (typeof auth == "string") {
          this.auth = new MultiFileAuthState(auth);
        } else this.auth = auth;

        const { state, saveCreds } = await getBaileysAuth(this.auth);

        this.sock = makeWASocket({
          auth: state,
          ...this.config,
        });

        this.configEvents.connectionResolve = resolve;
        this.configEvents.configure();

        this.sock.ev.on("creds.update", saveCreds);
      } catch (err) {
        reject(err?.stack || err);
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

    return this.connect(this.auth);
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
   * * Salva as mensagens enviadas salvas
   * @param messages Mensagens enviadas
   */
  public async saveSendedMessages(messages: any = this.sendedMessages) {
    await this.auth.set(`sendedMessages`, messages);
  }

  /**
   * * Obtem os chats salvos
   */
  public async readChats() {
    const chats: WAChat = (await this.auth.get(`chats`)) || {};

    for (const id of Object.keys(chats || {})) {
      const chat = chats[id];

      if (!!!chat) return;

      this.chats[id] = new WAChat(chat.id, chat.type, chat.name, chat.description, chat.profile);

      for (const userId of Object.keys(chat.users || {})) {
        const user = chat.users[userId];

        if (!!!user) continue;

        this.chats[id].users[userId] = new WAUser(user.id, user.name, user.description, user.profile);
        this.chats[id].users[userId].isAdmin = user.isAdmin;
        this.chats[id].users[userId].isLeader = user.isLeader;
      }
    }
  }

  /**
   * * Obtem os usuários salvos
   */
  public async readUsers() {
    const users: WAUsers = (await this.auth.get(`users`)) || {};

    for (const id of Object.keys(users || {})) {
      const user = users[id];

      if (!!!user) continue;

      this.users[id] = new WAUser(user.id, user.name, user.description, user.profile);
    }
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
   * * Obtem as mensagem enviadas salvas
   */
  public async readSendedMessages() {
    const messages: WAUsers = (await this.auth.get(`sendedMessages`)) || {};

    for (const id of Object.keys(messages || {})) {
      const msg = messages[id];

      if (!!!msg) continue;

      this.sendedMessages[id] = injectJSON(msg, new Message("", ""));
    }
  }

  /**
   * * Lê o chat
   * @param chat Sala de bate-papo
   */
  public async readChat(chat: any) {
    chat.id = replaceID(chat.id || chat.newJID);

    const newChat = this.chats[chat.id] || new WAChat(chat.id, chat.name || chat.verifiedName || chat.notify || chat.subject);

    if (newChat.id.includes("@g")) {
      if (!!!chat?.participants) {
        const metadata = await this.wcb.waitCall(() => this.sock?.groupMetadata(getID(newChat.id)));

        if (!!metadata) chat = metadata;

        await Promise.all(
          (chat?.participants || []).map(async (p: any) => {
            const user = this.users[replaceID(p.id)] || new WAUser(replaceID(p.id));

            user.isAdmin = p.admin == "admin" || p.isAdmin || p.isSuperAdmin || false;
            user.isLeader = p.admin == "superadmin" || p.isSuperAdmin || false;

            newChat.users[user.id] = user;
          })
        );
      }
    }

    newChat.name = chat.subject || chat.name || chat.verifiedName || chat.notify;
    newChat.description = chat?.desc || chat.description || "";

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

    if (event == "remove" && replaceID(userId) == this.id) {
      //? Obtem possíveis dados inexistentes
      var chat = await this.getChat(new WAChat(replaceID(chatId)));
      var user = await this.getUser(new WAUser(replaceID(userId)));
      var fromUser = await this.getUser(new WAUser(replaceID(fromId)));
    } else {
      //? Obtem dados já existentes
      var chat = this.chats[replaceID(chatId)] || new WAChat(replaceID(chatId), chatId.includes("@g") ? "group" : "pv");
      var fromUser = this.chats[replaceID(chatId)]?.users[replaceID(fromId)] || new WAUser(replaceID(fromId));
      var user = this.chats[replaceID(chatId)]?.users[replaceID(userId)] || new WAUser(replaceID(userId));
    }

    if (!this.chats.hasOwnProperty(chat.id)) this.chats[chat.id] = chat;

    if (!this.chats[chat.id]?.users?.hasOwnProperty(user.id)) {
      this.chats[chat.id].users[user.id] = user;
    }

    if (event == "add") this.chats[chat.id].users[user.id] = user;
    if (event == "promote") this.chats[chat.id].users[user.id].isAdmin = true;
    if (event == "demote") this.chats[chat.id].users[user.id].isAdmin = false;

    await this.saveChats();

    if (event == "remove") {
      if (user.id == this.id) {
        delete this.chats[chat.id];

        await this.saveChats();

        this.ev.emit("chat", { action: "remove", chat });

        return;
      } else {
        delete this.chats[chat.id].users[user.id];
      }
    }

    this.ev.emit("user", { action, event, user, fromUser, chat });
  }

  //! ********************************* CHAT *********************************

  public async getChatName(chat: IChat) {
    return (await this.getChat(chat))?.name || "";
  }

  public async setChatName(chat: IChat, name: string) {
    if (!chat.id.includes("@g")) return;

    if (!(await this.getChatAdmins(chat)).hasOwnProperty(this.id)) return;

    return this.wcb.waitCall(() => this.sock.groupUpdateSubject(getID(chat.id), name));
  }

  public async getChatDescription(chat: IChat) {
    return (await this.getChat(chat))?.description || "";
  }

  public async setChatDescription(chat: IChat, description: string): Promise<any> {
    if (!chat.id.includes("@g")) return;

    if (!(await this.getChatAdmins(chat)).hasOwnProperty(this.id)) return;

    return this.wcb.waitCall(() => this.sock.groupUpdateDescription(getID(chat.id), description));
  }

  public async getChatProfile(chat: IChat) {
    const uri = await this.wcb.waitCall(() => this.sock.profilePictureUrl(getID(chat.id), "image"));

    return await getImageURL(uri);
  }

  public async setChatProfile(chat: IChat, image: Buffer) {
    if (!chat.id.includes("@g")) return;

    if (!(await this.getChatAdmins(chat)).hasOwnProperty(this.id)) return;

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
    if (!this.chats[replaceID(chat.id)]) {
      const newChat = await this.readChat(chat);

      return newChat;
    }

    return this.chats[replaceID(chat.id)] || null;
  }

  public async setChat(chat: IChat) {
    if (chat.id.includes("status")) return;

    chat.id = replaceID(chat.id);

    if (chat.id.includes("@g")) chat.type = "group";
    if (!chat.id.includes("@")) chat.type = "pv";

    if (chat instanceof WAChat) {
      this.chats[chat.id] = new WAChat(chat.id, chat.type, chat.name, chat.description, chat.profile, chat.users);
    } else {
      this.chats[chat.id] = new WAChat(chat.id, chat.type);
    }

    await this.saveChats();
  }

  public async getChats(): Promise<WAChats> {
    return this.chats;
  }

  public async setChats(chats: WAChats) {
    this.chats = chats;
  }

  public async getChatUsers(chat: IChat): Promise<WAUsers> {
    const users: WAUsers = {};

    if (!this.chats.hasOwnProperty(chat.id)) return users;

    return this.chats[chat.id].users;
  }

  public async getChatAdmins(chat: IChat): Promise<WAUsers> {
    const users: WAUsers = {};

    if (!this.chats.hasOwnProperty(chat.id)) return users;

    for (const id in this.chats[chat.id].users) {
      const user = this.chats[chat.id].users[id];

      if (user.isAdmin || user.isLeader) {
        users[id] = user;
      }
    }

    return users;
  }

  public async getChatLeader(chat: IChat): Promise<WAUser> {
    let user: WAUser = new WAUser("");

    if (!this.chats.hasOwnProperty(chat.id)) return user;

    for (const id in this.chats[chat.id].users) {
      if (this.chats[chat.id].users[id].isLeader) {
        user = this.chats[chat.id].users[id];
      }
    }

    return user;
  }

  public async addUserInChat(chat: IChat, user: IUser) {
    if (!chat.id.includes("@g")) return;

    const bot = (await this.getChat(chat))?.users[this.id];

    if (!bot || !bot.isAdmin) return;

    await this.wcb.waitCall(() => this.sock?.groupParticipantsUpdate(getID(chat.id), [getID(user.id)], "add"));
  }

  public async removeUserInChat(chat: IChat, user: IUser) {
    if (!chat.id.includes("@g")) return;

    if (!(await this.getChatAdmins(chat)).hasOwnProperty(this.id)) return;

    await this.wcb.waitCall(() => this.sock?.groupParticipantsUpdate(getID(chat.id), [getID(user.id)], "remove"));
  }

  public async promoteUserInChat(chat: IChat, user: IUser): Promise<void> {
    if (!chat.id.includes("@g")) return;

    if (!(await this.getChatAdmins(chat)).hasOwnProperty(this.id)) return;

    await this.wcb.waitCall(() => this.sock?.groupParticipantsUpdate(getID(chat.id), [getID(user.id)], "promote"));
  }

  public async demoteUserInChat(chat: IChat, user: IUser): Promise<void> {
    if (!chat.id.includes("@g")) return;

    if (!(await this.getChatAdmins(chat)).hasOwnProperty(this.id)) return;

    await this.wcb.waitCall(() => this.sock?.groupParticipantsUpdate(getID(chat.id), [getID(user.id)], "demote"));
  }

  public async changeChatStatus(chat: IChat, status: ChatStatus): Promise<void> {
    return await this.wcb.waitCall(() => this.sock.sendPresenceUpdate(WAStatus[status] || "available", getID(WAChat.getId(chat))));
  }

  public async createChat(chat: IChat) {
    await this.wcb.waitCall(() => this.sock.groupCreate(chat.name || "", [getID(this.id)]));
  }

  public async leaveChat(chat: IChat): Promise<any> {
    if (this.chats.hasOwnProperty(replaceID(chat.id))) {
      if (!chat.id.includes("@g")) return;

      if (!(await this.getChatAdmins(chat)).hasOwnProperty(this.id)) return;

      return this.wcb.waitCall(() => this.sock.groupLeave(getID(chat.id)));
    }

    return this.removeChat(chat);
  }

  //! ******************************* USER *******************************

  public async getUserName(user: IUser) {
    return (await this.getChat(new WAChat(user.id)))?.name || "";
  }

  public async setUserName(user: IUser, name: string) {
    if (user.id == this.id) {
      return this.setBotName(name);
    }
  }

  public async getUserDescription(user: IUser) {
    return this.wcb.waitCall(async () => (await this.sock.fetchStatus(String(getID(user.id))))?.status || "");
  }

  public async setUserDescription(user: IUser, description: string): Promise<any> {
    if (user.id == this.id) {
      return this.setBotDescription(description);
    }
  }

  public async getUserProfile(user: IUser, lowQuality?: boolean) {
    const uri = await this.wcb.waitCall(() => this.sock.profilePictureUrl(getID(user.id), !!lowQuality ? "preview" : "image"));

    return await getImageURL(uri);
  }

  public async setUserProfile(user: IUser, image: Buffer) {
    if (user.id == this.id) {
      return this.setBotProfile(image);
    }
  }

  public async getUser(user: IUser): Promise<WAUser | null> {
    let usr: IUser | WAUser | WAChat = this.chats[user.id] || this.users[user.id];

    if (!usr) {
      return await this.readUser(user);
    }

    return injectJSON(usr, new WAUser(usr.id)) || null;
  }

  public async setUser(user: IUser): Promise<void> {
    if (user instanceof WAUser) {
      this.users[user.id] = new WAUser(user.id, user.name, user.description, user.profile);
    } else {
      this.users[user.id] = new WAUser(user.id);
    }

    await this.saveUsers(this.users);
  }

  public async getUsers(): Promise<WAUsers> {
    const users: WAUsers = {};

    for (const id in this.chats) {
      const chat = this.chats[id];

      if (chat.type != "pv" || chat.id.includes("@")) continue;

      users[id] = new WAUser(chat.id, chat.name, chat.description, chat.profile);
    }

    return users;
  }

  public async setUsers(users: WAUsers): Promise<void> {
    for (const id in users) {
      this.setUser(users[id]);
    }
  }

  public async addUser(user: IUser) {
    await this.setUser(user);
  }

  public async removeUser(user: IUser) {
    delete this.chats[user.id];
  }

  public async blockUser(user: IUser) {
    if (user.id == this.id) return;

    await this.wcb.waitCall(() => this.sock?.updateBlockStatus(getID(user.id), "block"));
  }

  public async unblockUser(user: IUser) {
    if (user.id == this.id) return;

    await this.wcb.waitCall(() => this.sock?.updateBlockStatus(getID(user.id), "unblock"));
  }

  //! ******************************** BOT ********************************

  public async getBotName() {
    return (await this.getChat(new WAChat(this.id)))?.name || "";
  }

  public async setBotName(name: string) {
    return this.wcb.waitCall(() => this.sock.updateProfileName(name));
  }

  public async getBotDescription() {
    return this.wcb.waitCall(async () => (await this.sock.fetchStatus(String(getID(this.id))))?.status || "");
  }

  public async setBotDescription(description: string) {
    return this.wcb.waitCall(() => this.sock.updateProfileStatus(description));
  }

  public async getBotProfile() {
    const uri = await this.wcb.waitCall(() => this.sock.profilePictureUrl(getID(this.id), "image"));

    return await getImageURL(uri);
  }

  public async setBotProfile(image: Buffer) {
    return this.wcb.waitCall(() => this.sock.updateProfilePicture(getID(this.id), image));
  }

  //! ******************************* MESSAGE *******************************

  /**
   * * Adiciona uma mensagem na lista de mensagens enviadas
   * @param message Mensagem que será adicionada
   */
  public async addSendedMessage(message: IMessage) {
    if (typeof message != "object" || !message || !!!message.id) return;

    message.apiSend = true;

    this.sendedMessages[message.id] = message;

    await this.saveSendedMessages();
  }

  /**
   * * Remove uma mensagem da lista de mensagens enviadas
   * @param message Mensagem que será removida
   */
  public async removeMessageIgnore(message: IMessage) {
    if (this.sendedMessages.hasOwnProperty(message.id)) {
      delete this.sendedMessages[message.id];
    }

    await this.saveSendedMessages();
  }

  public async readMessage(message: IMessage): Promise<void> {
    const key: proto.MessageKey = {
      remoteJid: getID(message.chat.id),
      id: message.id || "",
      fromMe: message.fromMe || message.user.id == this.id,
      participant: message.chat.id.includes("@g") ? getID(message.user.id || this.id) : undefined,
      toJSON: () => key,
    };

    return await this.wcb.waitCall(() => this.sock.readMessages([key]));
  }

  public async removeMessage(message: IMessage) {
    return await this.wcb.waitCall(() =>
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

    const msg = await this.wcb.waitCall(() => this.sock?.sendMessage(getID(message.chat.id), { delete: key }));

    await this.addSendedMessage(await new WhatsAppConvertMessage(this, msg).get());
  }

  public async addReaction(message: IMessage, reaction: string): Promise<void> {
    const reactionMessage = new ReactionMessage(message.chat, reaction, message);
    reactionMessage.user = message.user;

    const waMSG = new WhatsAppMessage(this, reactionMessage);
    await waMSG.refactory(reactionMessage);

    const msg = await this.wcb.waitCall(() => this.sock?.sendMessage(getID(message.chat.id), waMSG.message));

    await this.addSendedMessage(await new WhatsAppConvertMessage(this, msg).get());
  }

  public async removeReaction(message: IMessage): Promise<void> {
    const reactionMessage = new ReactionMessage(message.chat, "", message);
    reactionMessage.user = message.user;

    const waMSG = new WhatsAppMessage(this, reactionMessage);
    await waMSG.refactory(reactionMessage);

    const msg = await this.wcb.waitCall(() => this.sock?.sendMessage(getID(message.chat.id), waMSG.message));

    await this.addSendedMessage(await new WhatsAppConvertMessage(this, msg).get());
  }

  public async send(content: IMessage): Promise<IMessage> {
    const waMSG = new WhatsAppMessage(this, content);
    await waMSG.refactory(content);

    if (waMSG.isRelay) {
      const id = await this.wcb.waitCall(() => this.sock?.relayMessage(waMSG.chat, waMSG.message, { ...waMSG.options, messageId: waMSG.chat })).catch((err) => this.ev.emit("error", err));

      if (!!id && typeof id == "string") content.id = id;

      return content;
    }

    const sendedMessage = await this.wcb.waitCall(() => this.sock?.sendMessage(waMSG.chat, waMSG.message, waMSG.options)).catch((err) => this.ev.emit("error", err));

    if (typeof sendedMessage == "boolean") return content;

    const msgRes = (await new WhatsAppConvertMessage(this, sendedMessage).get()) || content;

    if (isPollMessage(msgRes) && isPollMessage(content)) {
      msgRes.options = content.options;
      msgRes.secretKey = sendedMessage.message.messageContextInfo.messageSecret;

      this.polls[msgRes.id] = msgRes;

      await this.savePolls(this.polls);
    }

    await this.addSendedMessage(msgRes);

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
  public updateMediaMessage(message: proto.IWebMessageInfo): Promise<proto.IWebMessageInfo> {
    return this.sock.updateMediaMessage(message);
  }

  /**
   * * Aceita o convite para um grupo
   * @param code
   * @returns
   */
  public groupAcceptInvite(code: string): Promise<string | undefined> | undefined {
    return this.sock?.groupAcceptInvite(code);
  }

  /**
   * * Gera a configuração de navegador
   * @param name Nome da plataforma
   * @param browser Nome do navegador
   * @param version Versão do navegador
   */
  public static Browser(name: string = "Rompot", browser: string = "Chrome", version: string = "1.4.6") {
    return [name, browser, version] as [string, string, string];
  }
}
