import makeWASocket, { DisconnectReason, downloadMediaMessage, proto, MediaDownloadOptions, ConnectionState, WAMessage, MessageUpsertType, WASocket, SocketConfig } from "@adiwajshing/baileys";
import { Boom } from "@hapi/boom";
import internal from "stream";
import pino from "pino";

import { getBaileysAuth, MultiFileAuthState } from "@wa/Auth";
import { WhatsAppConvertMessage } from "@wa/WAConvertMessage";
import { WhatsAppMessage } from "@wa/WAMessage";
import { getID, replaceID } from "@wa/ID";
import { WAStatus } from "@wa/WAStatus";

import IAuth from "@interfaces/IAuth";
import IBot from "@interfaces/IBot";

import ReactionMessage from "@messages/ReactionMessage";
import PollMessage from "@messages/PollMessage";
import Message from "@messages/Message";

import User from "@modules/User";
import Chat from "@modules/Chat";

import { getImageURL } from "@utils/Generic";
import { BotEvents } from "@utils/Emmiter";

import WaitCallBack from "@utils/WaitCallBack";
import { getError } from "@utils/Generic";

import { ConnectionStatus } from "../types/Connection";
import { Chats, ChatStatus } from "../types/Chat";
import { Media } from "../types/Message";
import { Users } from "../types/User";

export default class WhatsAppBot implements IBot {
  //@ts-ignore
  private sock: WASocket = {};
  public DisconnectReason = DisconnectReason;
  public users: Users = {};
  public ev: BotEvents = new BotEvents();
  public status: ConnectionStatus = "offline";
  public id: string = "";
  public auth: IAuth = new MultiFileAuthState("./session", false);
  public logger: any = pino({ level: "silent" });
  public wcb: WaitCallBack = new WaitCallBack((err: any) => this.ev.emit("error", err));
  public config: Partial<SocketConfig>;

  public chats: Chats = {};
  public polls: { [id: string]: PollMessage } = {};

  constructor(config?: Partial<SocketConfig>) {
    this.config = {
      printQRInTerminal: true,
      connectTimeoutMs: 2000,
      defaultQueryTimeoutMs: 30000,
      logger: this.logger,
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

        this.sock = makeWASocket({ auth: state, ...this.config });
        this.sock.ev.on("creds.update", saveCreds);

        this.sock.ev.on("connection.update", async (update: Partial<ConnectionState>) => {
          if (update.connection == "connecting") {
            this.ev.emit("conn", { action: "connecting" });
          }

          if (update.qr) {
            this.ev.emit("qr", update.qr);
          }

          if (update.connection == "open") {
            this.status = "online";

            this.id = replaceID(this.sock?.user?.id || "");

            await this.readChats();
            await this.readUsers();
            await this.readPolls();

            this.ev.emit("open", { isNewLogin: update.isNewLogin || false });

            resolve();
          }

          if (update.connection == "close") {
            // Client desligado
            const status = (update.lastDisconnect?.error as Boom)?.output?.statusCode || update.lastDisconnect?.error || 500;
            const botStatus = String(this.status);

            if (this.status == "online") {
              this.status = "offline";

              this.ev.emit("close", { status: "offline" });
            }

            if (status == DisconnectReason.badSession || status === DisconnectReason.loggedOut) {
              this.ev.emit("closed", { status: "offline" });
              return;
            }

            if (status == DisconnectReason.restartRequired) {
              return resolve(await this.reconnect(false));
            }

            setTimeout(async () => resolve(await this.reconnect(botStatus != "online")), 1000);
          }
        });

        this.sock.ev.on("contacts.update", (updates: any) => {
          for (const update of updates) {
            update.id = replaceID(update.id);

            if (this.chats[update.id]) {
              const name = update.notify || update.verifiedName;

              if (this.chats[update.id].name !== name) {
                this.chatUpsert(update);
              }
            } else this.chatUpsert(update);
          }
        });

        this.sock.ev.on("chats.upsert", (updates: any) => {
          for (const update of updates) {
            update.id = replaceID(update.id);

            if (!this.chats[update.id]) this.chatUpsert(update);
            else if (!this.chats[update.id].users[this.id]) {
              this.chats[update.id].users[this.id] = new User(this.id);
            }
          }
        });

        this.sock.ev.on("chats.update", (updates: any) => {
          for (const update of updates) {
            update.id = replaceID(update.id);

            if (!this.chats[update.id] && !update.readOnly) this.chatUpsert(update);
          }
        });

        this.sock.ev.on("chats.delete", (deletions: any) => {
          for (const id of deletions) this.removeChat(new Chat(id));
        });

        this.sock.ev.on("groups.update", (updates: any) => {
          for (const update of updates) {
            update.id = replaceID(update.id);

            if (this.chats[update.id]) {
              if (update.subject) {
                this.chats[update.id].name = update.subject;

                this.saveChats();
              }
            }
          }
        });

        this.sock.ev.on("group-participants.update", async ({ id, participants, action }) => {
          id = replaceID(id);

          if (!this.chats[id]) {
            if (action != "remove") await this.chatUpsert({ id });
            else if (!participants.includes(getID(this.id))) await this.chatUpsert({ id });
          }

          for (let p of participants) {
            p = replaceID(p);

            const user = new User(p);

            if (!this.chats.hasOwnProperty(id)) {
              this.chats[id] = new Chat(id);
            }

            if (!this.chats[id].users.hasOwnProperty(p)) {
              this.chats[id].users[p] = user;
            }

            if (action == "add") this.chats[id].users[p] = user;
            if (action == "promote") this.chats[id].users[p].isAdmin = true;
            if (action == "demote") {
              this.chats[id].users[p].isAdmin = false;
              this.chats[id].users[p].isLeader = false;
            }

            const chat: Chat = new Chat(id);

            if (this.chats[id]) {
              chat.name = this.chats[id].name;
              chat.description = this.chats[id].description;
              chat.users = this.chats[id].users;
              chat.type = this.chats[id].type;

              const m = this.chats[id]?.users[user.id];

              user.id = m?.id || "";
              user.name = m?.name || "";
              user.isAdmin = m?.isAdmin || false;
              user.isLeader = m?.isLeader || false;
            }

            if (action == "remove") {
              if (p == this.id) {
                delete this.chats[id];

                this.ev.emit("chat", { action: "remove", chat });
              } else {
                delete this.chats[id]?.users[user.id];
              }
            }

            this.ev.emit("user", { action, user: user, chat });
          }
        });

        this.sock.ev.on("messages.upsert", async (m: { messages: WAMessage[]; type: MessageUpsertType }) => {
          try {
            if (m.messages.length <= 0) return;

            const message: WAMessage = m.messages[m.messages.length - 1];

            if (message.key.remoteJid == "status@broadcast") return;
            if (!message.message) return;

            const msg = await new WhatsAppConvertMessage(this, message, m.type).get();

            this.ev.emit("message", msg);
          } catch (err) {
            this.ev.emit("error", err);
          }
        });

        this.ev.on("chat", () => this.saveChats(this.chats));
      } catch (err: any) {
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
   * * Obtem os chats salvos
   */
  public async readChats() {
    const chats: Chats = (await this.auth.get(`chats`)) || {};

    for (const id of Object.keys(chats || {})) {
      const chat = chats[id];

      if (!!!chat) return;

      this.chats[id] = new Chat(chat.id, chat.type, chat.name, chat.description, chat.profile);

      for (const userId of Object.keys(chat.users || {})) {
        const user = chat.users[userId];

        if (!!!user) continue;

        this.chats[id].users[userId] = new User(user.id, user.name, user.description, user.profile);
        this.chats[id].users[userId].isAdmin = user.isAdmin;
        this.chats[id].users[userId].isLeader = user.isLeader;
      }
    }
  }

  /**
   * * Obtem os usuários salvos
   */
  public async readUsers() {
    const users: Users = (await this.auth.get(`users`)) || {};

    for (const id of Object.keys(users || {})) {
      const user = users[id];

      if (!!!user) continue;

      this.users[id] = new User(user.id, user.name, user.description, user.profile);
    }
  }

  /**
   * * Obtem as mensagem de enquete salvas
   */
  public async readPolls() {
    const polls: Users = (await this.auth.get(`polls`)) || {};

    for (const id of Object.keys(polls || {})) {
      const poll = polls[id];

      if (!!!poll) continue;

      this.polls[id] = PollMessage.fromJSON(poll);
    }
  }

  //! ********************************* CHAT *********************************

  /**
   * * Lê o chat e seta ele
   * @param chat Sala de bate-papo
   */
  protected async chatUpsert(chat: any) {
    try {
      if (chat.id || chat.newJId) {
        chat.id = replaceID(chat.id || chat.newJID);

        const newChat = new Chat(chat.id, chat.name || chat.verifiedName || chat.notify || chat.subject);

        if (newChat.id.includes("@g")) {
          if (!chat.participants) {
            const metadata = await this.wcb.waitCall(() => this.sock?.groupMetadata(getID(newChat.id)));

            if (metadata == null) return;

            chat.participants = metadata?.participants || [];
            newChat.name = metadata?.subject;

            newChat.description = metadata?.desc || "";
          }

          for (const user of chat.participants) {
            const u = new User(replaceID(user.id));

            u.isAdmin = !!user.admin || user.isAdmin || user.isSuperAdmin || false;
            u.isLeader = user.admin == "superadmin" || user.isSuperAdmin || false;

            newChat.users[u.id] = u;
          }
        }

        this.addChat(newChat);
      }
    } catch (err) {
      this.ev.emit("error", getError(err));
    }
  }

  /**
   * * Lê o usuário e seta ele
   * @param user Usuário
   */
  protected async userUpsert(user: any) {
    try {
      if (user.id || user.newJId) {
        user.id = replaceID(user.id || user.newJID);

        const newUser = new User(user.id, user.name || user.verifiedName || user.notify || user.subject);

        newUser.description = user?.desc || "";

        this.addUser(newUser);
      }
    } catch (err) {
      this.ev.emit("error", getError(err));
    }
  }

  public async addChat(chat: Chat) {
    await this.setChat(chat);

    if (this.chats[replaceID(chat.id)]) {
      this.ev.emit("chat", { action: "add", chat: this.chats[replaceID(chat.id)] });
    }
  }

  public async removeChat(chat: Chat) {
    delete this.chats[chat.id];

    this.ev.emit("chat", { action: "remove", chat });
  }

  public async getChat(chat: Chat): Promise<Chat | null> {
    try {
      if (!this.chats[replaceID(chat.id)]) {
        if (chat.id.includes("@s") || !chat.id.includes("@")) {
          await this.chatUpsert(new Chat(chat.id));
        }

        if (chat.id.includes("@g")) {
          const metadata = await this.wcb.waitCall(() => this.sock?.groupMetadata(getID(chat.id)));
          if (metadata) await this.chatUpsert(metadata);
        }
      }
    } catch (err) {
      this.ev.emit("error", getError(err));
    }

    return this.chats[replaceID(chat.id)] || null;
  }

  public async setChat(chat: Chat) {
    if (chat.id.includes("status")) return;

    chat.id = replaceID(chat.id);

    if (chat.id.includes("@g")) chat.type = "group";
    if (!chat.id.includes("@")) chat.type = "pv";

    this.chats[chat.id] = new Chat(chat.id, chat.type, chat.name, chat.description, chat.profile, chat.users);
  }

  public async getChats(): Promise<Chats> {
    return this.chats;
  }

  public async setChats(chats: Chats) {
    this.chats = chats;
  }

  public async getChatAdmins(chat: Chat): Promise<Users> {
    const users: Users = {};

    if (!this.chats.hasOwnProperty(chat.id)) return users;

    for (const id in this.chats[chat.id].users) {
      const user = this.chats[chat.id].users[id];

      if (user.isAdmin || user.isLeader) {
        users[id] = user;
      }
    }

    return users;
  }

  public async getChatLeader(chat: Chat): Promise<User> {
    let user: User = new User("");

    if (!this.chats.hasOwnProperty(chat.id)) return user;

    for (const id in this.chats[chat.id].users) {
      if (this.chats[chat.id].users[id].isLeader) {
        user = this.chats[chat.id].users[id];
      }
    }

    return user;
  }

  public async addUserInChat(chat: Chat, user: User) {
    if (!chat.id.includes("@g")) return;

    const bot = (await this.getChat(chat))?.users[this.id];

    if (!bot || !bot.isAdmin) return;

    await this.wcb.waitCall(() => this.sock?.groupParticipantsUpdate(getID(chat.id), [getID(user.id)], "add"));
  }

  public async removeUserInChat(chat: Chat, user: User) {
    if (!chat.id.includes("@g")) return;

    if (!(await this.getChatAdmins(chat)).hasOwnProperty(this.id)) return;

    await this.wcb.waitCall(() => this.sock?.groupParticipantsUpdate(getID(chat.id), [getID(user.id)], "remove"));
  }

  public async promoteUserInChat(chat: Chat, user: User): Promise<void> {
    if (!chat.id.includes("@g")) return;

    if (!(await this.getChatAdmins(chat)).hasOwnProperty(this.id)) return;

    await this.wcb.waitCall(() => this.sock?.groupParticipantsUpdate(getID(chat.id), [getID(user.id)], "promote"));
  }

  public async demoteUserInChat(chat: Chat, user: User): Promise<void> {
    if (!chat.id.includes("@g")) return;

    if (!(await this.getChatAdmins(chat)).hasOwnProperty(this.id)) return;

    await this.wcb.waitCall(() => this.sock?.groupParticipantsUpdate(getID(chat.id), [getID(user.id)], "demote"));
  }

  public async changeChatStatus(chat: Chat, status: ChatStatus): Promise<void> {
    return await this.wcb.waitCall(() => this.sock.sendPresenceUpdate(WAStatus[status] || "available", getID(Chat.getId(chat))));
  }

  public async createChat(chat: Chat) {
    await this.wcb.waitCall(() => this.sock.groupCreate(chat.name || "", [getID(this.id)]));
  }

  public async leaveChat(chat: Chat): Promise<any> {
    if (this.chats.hasOwnProperty(replaceID(chat.id))) {
      if (!chat.id.includes("@g")) return;

      if (!(await this.getChatAdmins(chat)).hasOwnProperty(this.id)) return;

      return this.wcb.waitCall(() => this.sock.groupLeave(getID(chat.id)));
    }

    return this.removeChat(chat);
  }

  public async getUser(user: User): Promise<User | null> {
    const usr = this.chats[user.id] || this.users[user.id];

    if (!usr) return null;

    return new User(usr.id, usr.name, usr.description, usr.profile);
  }

  public async setUser(user: User): Promise<void> {
    this.users[user.id] = new User(user.id, user.name, user.description, user.profile);

    await this.saveUsers(this.users);
  }

  public async getUsers(): Promise<Users> {
    const users: Users = {};

    for (const id in this.chats) {
      const chat = this.chats[id];

      if (chat.type != "pv" || chat.id.includes("@")) continue;

      users[id] = new User(chat.id, chat.name, chat.description, chat.profile);
    }

    return users;
  }

  public async setUsers(users: Users): Promise<void> {
    for (const id in users) {
      this.setUser(users[id]);
    }
  }

  public async addUser(user: User) {
    await this.setUser(user);
  }

  public async removeUser(user: User) {
    delete this.chats[user.id];
  }

  public async blockUser(user: User) {
    if (user.id == this.id) return;

    await this.wcb.waitCall(() => this.sock?.updateBlockStatus(getID(user.id), "block"));
  }

  public async unblockUser(user: User) {
    if (user.id == this.id) return;

    await this.wcb.waitCall(() => this.sock?.updateBlockStatus(getID(user.id), "unblock"));
  }

  //! ******************************** NOME ********************************

  public async getBotName() {
    return (await this.getChat(new Chat(this.id)))?.name || "";
  }

  public async setBotName(name: string) {
    return this.wcb.waitCall(() => this.sock.updateProfileName(name));
  }

  public async getUserName(user: User) {
    return (await this.getChat(new Chat(user.id)))?.name || "";
  }

  public async setUserName(user: User, name: string) {
    if (user.id == this.id) {
      return this.setBotName(name);
    }
  }

  public async getChatName(chat: Chat) {
    return (await this.getChat(chat))?.name || "";
  }

  public async setChatName(chat: Chat, name: string) {
    if (!chat.id.includes("@g")) return;

    if (!(await this.getChatAdmins(chat)).hasOwnProperty(this.id)) return;

    return this.wcb.waitCall(() => this.sock.groupUpdateSubject(getID(chat.id), name));
  }

  //! ******************************* PROFILE *******************************

  public async getBotProfile() {
    const uri = await this.wcb.waitCall(() => this.sock.profilePictureUrl(getID(this.id), "image"));

    return await getImageURL(uri);
  }

  public async setBotProfile(image: Buffer) {
    return this.wcb.waitCall(() => this.sock.updateProfilePicture(getID(this.id), image));
  }

  public async getUserProfile(user: User) {
    const uri = await this.wcb.waitCall(() => this.sock.profilePictureUrl(getID(user.id), "image"));

    return await getImageURL(uri);
  }

  public async setUserProfile(user: User, image: Buffer) {
    if (user.id == this.id) {
      return this.setBotProfile(image);
    }
  }

  public async getChatProfile(chat: Chat) {
    const uri = await this.wcb.waitCall(() => this.sock.profilePictureUrl(getID(chat.id), "image"));

    return await getImageURL(uri);
  }

  public async setChatProfile(chat: Chat, image: Buffer) {
    if (!chat.id.includes("@g")) return;

    if (!(await this.getChatAdmins(chat)).hasOwnProperty(this.id)) return;

    return this.wcb.waitCall(() => this.sock.updateProfilePicture(getID(chat.id), image));
  }

  //! ****************************** DESCRIÇÃO ******************************

  public async getBotDescription() {
    return this.wcb.waitCall(async () => (await this.sock.fetchStatus(String(getID(this.id))))?.status || "");
  }

  public async setBotDescription(description: string) {
    return this.wcb.waitCall(() => this.sock.updateProfileStatus(description));
  }

  public async getUserDescription(user: User) {
    return this.wcb.waitCall(async () => (await this.sock.fetchStatus(String(getID(user.id))))?.status || "");
  }

  public async setUserDescription(user: User, description: string): Promise<any> {
    if (user.id == this.id) {
      return this.setBotDescription(description);
    }
  }

  public async getChatDescription(chat: Chat) {
    return (await this.getChat(chat))?.description || "";
  }

  public async setChatDescription(chat: Chat, description: string): Promise<any> {
    if (!chat.id.includes("@g")) return;

    if (!(await this.getChatAdmins(chat)).hasOwnProperty(this.id)) return;

    return this.wcb.waitCall(() => this.sock.groupUpdateDescription(getID(chat.id), description));
  }

  //! ******************************* MESSAGE *******************************

  public async readMessage(message: Message): Promise<void> {
    const key: proto.MessageKey = {
      remoteJid: getID(message.chat.id),
      id: message.id || "",
      fromMe: message.fromMe || message.user.id == this.id,
      participant: message.chat.id.includes("@g") ? getID(message.user.id || this.id) : getID(this.id),
      toJSON: () => message,
    };

    return await this.wcb.waitCall(() => this.sock.readMessages([key]));
  }

  public async removeMessage(message: Message) {
    return await this.wcb.waitCall(() =>
      this.sock?.chatModify(
        {
          clear: { messages: [{ id: message.id || "", fromMe: message.user.id == this.id, timestamp: Number(message.timestamp || Date.now()) }] },
        },
        getID(message.chat.id)
      )
    );
  }

  public async deleteMessage(message: Message) {
    const key: any = { remoteJid: getID(message.chat.id), id: message.id };

    if (message.chat.id.includes("@g")) {
      if (message.user.id != this.id && !(await this.getChatAdmins(message.chat)).hasOwnProperty(this.id)) return;

      key.participant = getID(message.user.id);
    }

    await this.wcb.waitCall(() => this.sock?.sendMessage(getID(message.chat.id), { delete: key }));
  }

  public async addReaction(message: Message, reaction: string): Promise<void> {
    const reactionMessage = new ReactionMessage(message.chat, reaction, message);
    reactionMessage.user = message.user;

    const waMSG = new WhatsAppMessage(this, reactionMessage);
    await waMSG.refactory(reactionMessage);

    await this.wcb.waitCall(() => this.sock?.sendMessage(getID(message.chat.id), waMSG.message));
  }

  public async removeReaction(message: Message): Promise<void> {
    const reactionMessage = new ReactionMessage(message.chat, "", message);
    reactionMessage.user = message.user;

    const waMSG = new WhatsAppMessage(this, reactionMessage);
    await waMSG.refactory(reactionMessage);

    await this.wcb.waitCall(() => this.sock?.sendMessage(getID(message.chat.id), waMSG.message));
  }

  public async send(content: Message): Promise<Message> {
    const waMSG = new WhatsAppMessage(this, content);
    await waMSG.refactory(content);

    if (waMSG.isRelay) {
      await this.wcb.waitCall(() => this.sock?.relayMessage(waMSG.chat, waMSG.message, { ...waMSG.options, messageId: waMSG.chat })).catch((err) => this.ev.emit("error", err));

      return content;
    }

    const sendedMessage = await this.wcb.waitCall(() => this.sock?.sendMessage(waMSG.chat, waMSG.message, waMSG.options)).catch((err) => this.ev.emit("error", err));

    if (typeof sendedMessage == "boolean") return content;

    const msgRes = (await new WhatsAppConvertMessage(this, sendedMessage).get()) || content;

    if (msgRes instanceof PollMessage && content instanceof PollMessage) {
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
}
