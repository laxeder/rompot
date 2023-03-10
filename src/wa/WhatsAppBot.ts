import makeWASocket, {
  DisconnectReason,
  downloadMediaMessage,
  proto,
  MediaDownloadOptions,
  ConnectionState,
  WAMessage,
  MessageUpsertType,
  WASocket,
  generateWAMessage,
  SocketConfig,
} from "@adiwajshing/baileys";
import { Boom } from "@hapi/boom";

import { WhatsAppConvertMessage } from "@wa/WAConvertMessage";
import { getBaileysAuth, MultiFileAuthState } from "@wa/Auth";
import { WhatsAppMessage } from "@wa/WAMessage";
import { getID, replaceID } from "@wa/ID";
import { WAStatus } from "@wa/WAStatus";

import { IMessage } from "@interfaces/Messages";
import { IChat } from "@interfaces/Chat";
import { IUser } from "@interfaces/User";
import IBot from "@interfaces/IBot";
import Auth from "@interfaces/Auth";

import MediaMessage from "@messages/MediaMessage";

import User from "@modules/User";
import Chat from "@modules/Chat";

import { getChatId, getImageURL } from "@utils/Generic";
import { BotEvents } from "@utils/Emmiter";

import WaitCallBack from "@utils/WaitCallBack";
import { getError } from "@utils/Generic";

import { ConnectionStatus } from "../types/Connection";
import { ChatStatus, IChats } from "../types/Chat";
import { IUsers } from "../types/User";
import pino from "pino";

export default class WhatsAppBot implements IBot {
  //@ts-ignore
  private sock: WASocket = {};
  public DisconnectReason = DisconnectReason;
  public chats: IChats = {};
  public ev: BotEvents = new BotEvents();
  public status: ConnectionStatus = "offline";
  public id: string = "";
  public auth: Auth = new MultiFileAuthState("./session");
  public wcb: WaitCallBack = new WaitCallBack();
  public config: Partial<SocketConfig>;

  constructor(config?: Partial<SocketConfig>) {
    this.config = {
      printQRInTerminal: true,
      connectTimeoutMs: 2000,
      logger: pino({ level: "fatal" }),
      ...config,
    };
  }

  public async connect(auth?: string | Auth): Promise<void> {
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

            const chats: IChats = JSON.parse((await this.auth.get(`chats`)) || "{}");

            if (!!chats) {
              Object.keys(chats).forEach((key) => {
                key = replaceID(key);

                const chat = chats[key];

                if (!!!chat) return;

                this.chats[key] = new Chat(replaceID(chat.id), chat.type, chat.name, chat.description, chat.profile);

                if (chat?.users) {
                  Object.keys(chat?.users || {}).forEach((userKey) => {
                    if (!!!userKey) return;

                    userKey = replaceID(userKey);

                    const user = chat?.users[userKey];

                    if (!!!user) return;

                    this.chats[key].users[userKey] = new User(replaceID(user.id), user.name, user.description);
                    this.chats[key].users[userKey].isAdmin = user.isAdmin;
                    this.chats[key].users[userKey].isLeader = user.isLeader;
                  });
                }
              });
            }

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

            if (action == "add") this.chats[id].users[p] = user;
            if (action == "promote") this.chats[id].users[p].isAdmin = true;
            if (action == "demote") {
              this.chats[id].users[p].isAdmin = false;
              this.chats[id].users[p].isLeader = false;
            }

            const chat: IChat = new Chat(id);

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
          if (m.messages.length <= 0) return;

          const message: WAMessage = m.messages[m.messages.length - 1];

          if (message.key.remoteJid == "status@broadcast") return;
          if (!message.message) return;

          const msg = await new WhatsAppConvertMessage(this, message, m.type).get();

          this.ev.emit("message", msg);
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

  //! ********************************* CHAT *********************************

  /**
   * * Salva os chats salvos
   * @param chats Sala de bate-papos
   */
  protected async saveChats(chats: any = this.chats) {
    await this.auth.set(`chats`, JSON.stringify(chats));
  }

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

            chat.participants = metadata?.participants || [];
            newChat.name = metadata?.subject;

            newChat.description = Buffer.from(metadata?.desc || "", "base64").toString();
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

  public async addChat(chat: IChat) {
    await this.setChat(chat);

    if (this.chats[replaceID(chat.id)]) {
      this.ev.emit("chat", { action: "add", chat: this.chats[replaceID(chat.id)] });
    }
  }

  public async removeChat(chat: IChat) {
    delete this.chats[chat.id];

    this.ev.emit("chat", { action: "remove", chat });
  }

  public async getChat(chat: IChat): Promise<IChat | null> {
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

  public async setChat(chat: IChat) {
    if (chat.id.includes("status")) return;

    chat.id = replaceID(chat.id);

    if (chat.id.includes("@g")) chat.type = "group";
    if (!chat.id.includes("@")) chat.type = "pv";

    this.chats[chat.id] = new Chat(chat.id, chat.type, chat.name, chat.description);
    this.chats[chat.id].profile = chat.profile;
    this.chats[chat.id].status = chat.status;
  }

  public async getChats(): Promise<IChats> {
    return this.chats;
  }

  public async setChats(chats: IChats) {
    this.chats = chats;
  }

  public async getChatAdmins(chat: IChat): Promise<IUsers> {
    const users: IUsers = {};

    if (!this.chats.hasOwnProperty(chat.id)) return users;

    for (const id in this.chats[chat.id].users) {
      const user = this.chats[chat.id].users[id];

      if (user.isAdmin || user.isLeader) {
        users[id] = user;
      }
    }

    return users;
  }

  public async getChatLeader(chat: IChat): Promise<IUser> {
    let user: IUser = new User("");

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
    return await this.wcb.waitCall(() => this.sock.sendPresenceUpdate(WAStatus[status] || "available", getID(getChatId(chat))));
  }

  public async createChat(chat: IChat) {
    return this.wcb.waitCall(() => this.sock.groupCreate(chat.name || "", [getID(this.id)]));
  }

  public async leaveChat(chat: IChat): Promise<any> {
    if (this.chats.hasOwnProperty(replaceID(chat.id))) {
      if (!chat.id.includes("@g")) return;

      if (!(await this.getChatAdmins(chat)).hasOwnProperty(this.id)) return;

      return this.wcb.waitCall(() => this.sock.groupLeave(getID(chat.id)));
    }

    return this.removeChat(chat);
  }

  public async getUser(user: IUser): Promise<IUser | null> {
    if (this.chats.hasOwnProperty(user.id)) {
      const chat = this.chats[user.id];

      return new User(chat.id, chat.name, chat.description);
    }

    return null;
  }

  public async setUser(user: IUser): Promise<void> {
    this.chats[user.id] = new Chat(user.id, "pv", user.name, user.description, user.profile);
  }

  public async getUsers(): Promise<IUsers> {
    const users: IUsers = {};

    for (const id in this.chats) {
      const chat = this.chats[id];

      if (chat.type != "pv" || chat.id.includes("@")) continue;

      users[id] = new User(chat.id, chat.name, chat.description, chat.profile);
    }

    return users;
  }

  public async setUsers(users: IUsers): Promise<void> {
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

  //! ******************************** NOME ********************************

  public async getBotName() {
    return (await this.getChat(new Chat(this.id)))?.name || "";
  }

  public async setBotName(name: string) {
    return this.wcb.waitCall(() => this.sock.updateProfileName(name));
  }

  public async getUserName(user: IUser) {
    return (await this.getChat(new Chat(user.id)))?.name || "";
  }

  public async setUserName(user: IUser, name: string) {
    if (user.id == this.id) {
      return this.setBotName(name);
    }
  }

  public async getChatName(chat: IChat) {
    return (await this.getChat(chat))?.name || "";
  }

  public async setChatName(chat: IChat, name: string) {
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

  public async getUserProfile(user: IUser) {
    const uri = await this.wcb.waitCall(() => this.sock.profilePictureUrl(getID(user.id), "image"));

    return await getImageURL(uri);
  }

  public async setUserProfile(user: IUser, image: Buffer) {
    if (user.id == this.id) {
      return this.setBotProfile(image);
    }
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

  //! ****************************** DESCRIÇÃO ******************************

  public async getBotDescription() {
    return this.wcb.waitCall(async () => (await this.sock.fetchStatus(String(getID(this.id))))?.status || "");
  }

  public async setBotDescription(description: string) {
    return this.wcb.waitCall(() => this.sock.updateProfileStatus(description));
  }

  public async getUserDescription(user: IUser) {
    return this.wcb.waitCall(async () => (await this.sock.fetchStatus(String(getID(user.id))))?.status || "");
  }

  public async setUserDescription(user: IUser, description: string): Promise<any> {
    if (user.id == this.id) {
      return this.setBotDescription(description);
    }
  }

  public async getChatDescription(chat: IChat) {
    return (await this.getChat(chat))?.description || "";
  }

  public async setChatDescription(chat: IChat, description: string): Promise<any> {
    if (!chat.id.includes("@g")) return;

    if (!(await this.getChatAdmins(chat)).hasOwnProperty(this.id)) return;

    return this.wcb.waitCall(() => this.sock.groupUpdateDescription(getID(chat.id), description));
  }

  //! ******************************* MESSAGE *******************************

  public async readMessage(message: IMessage): Promise<void> {
    const key: proto.IMessageKey = { remoteJid: getID(message.chat.id), id: message.id || "", fromMe: message.user.id == this.id };

    if (message.chat.id.includes("@g")) {
      key.participant = getID(message.user.id);
    }

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

    await this.wcb.waitCall(() => this.sock?.sendMessage(getID(message.chat.id), { delete: key }));
  }

  public async addReaction(message: IMessage, reaction: string): Promise<void> {
    const waMSG = new WhatsAppMessage(this, message);
    await waMSG.refactory(message);

    await this.wcb.waitCall(() => this.sock?.sendMessage(getID(message.chat.id), { react: { key: waMSG.message.key, text: reaction } }));
  }

  public async removeReaction(message: IMessage): Promise<void> {
    const waMSG = new WhatsAppMessage(this, message);
    await waMSG.refactory(message);

    await this.wcb.waitCall(() => this.sock?.sendMessage(getID(message.chat.id), { react: { key: waMSG.message.key, text: "" } }));
  }

  public async send(content: IMessage): Promise<IMessage> {
    if (content instanceof MediaMessage) {
      await this.changeChatStatus(content.chat, "recording");
    } else {
      await this.changeChatStatus(content.chat, "typing");
    }

    const waMSG = new WhatsAppMessage(this, content);
    await waMSG.refactory(content);

    const { chat, message, options } = waMSG;

    var sendedMessage: proto.WebMessageInfo | undefined;

    if (message.hasOwnProperty("templateButtons")) {
      const ctx: any = {};
      const fullMsg = await this.wcb.waitCall(() =>
        generateWAMessage(chat, message, {
          userJid: getID(this.id),
          ...ctx,
        })
      );

      fullMsg.message = { viewOnceMessage: { message: fullMsg.message } };

      await this.wcb.waitCall(() => this.sock?.relayMessage(chat, fullMsg.message!, { messageId: fullMsg.key.id! }));

      sendedMessage = fullMsg;
    } else {
      sendedMessage = await this.wcb.waitCall(() => this.sock?.sendMessage(chat, message, options));
    }

    return sendedMessage ? await new WhatsAppConvertMessage(this, sendedMessage).get() : content;
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
