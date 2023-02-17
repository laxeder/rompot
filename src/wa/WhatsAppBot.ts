import { Boom } from "@hapi/boom";
import makeWASocket, { DisconnectReason, downloadMediaMessage, proto, MediaDownloadOptions, ConnectionState, WAMessage, MessageUpsertType, WASocket, generateWAMessage } from "@adiwajshing/baileys";

import { WhatsAppConvertMessage } from "@wa/WAConvertMessage";
import { getBaileysAuth, MultiFileAuthState } from "@wa/Auth";
import { WhatsAppMessage } from "@wa/WAMessage";
import WAChat, { WAChats } from "@wa/WAChat";
import { getID, replaceID } from "@wa/ID";
import { WAStatus } from "@wa/WAStatus";
import WAUser, { WAUsers } from "@wa/WAUser";

import { ConnectionConfig, DefaultConnectionConfig } from "@config/ConnectionConfig";

import ChatInterface from "@interfaces/ChatInterface";
import UserInterface from "@interfaces/UserInterface";
import BotInterface from "@interfaces/BotInterface";
import Auth from "@interfaces/Auth";

import { MessageInterface } from "@interfaces/MessagesInterfaces";
import MediaMessage from "@messages/MediaMessage";
import Message from "@messages/Message";

import Chat from "@modules/Chat";

import getImageURL from "@utils/getImageURL";
import Emmiter from "@utils/Emmiter";

import WaitCallBack from "@utils/WaitCallBack";
import { getError } from "@utils/error";

import { ConnectionStatus } from "../types/Connection";
import { Commands } from "../types/Command";
import { ChatStatus } from "../types/Chat";
import { Users } from "../types/User";

export class WhatsAppBot implements BotInterface {
  //@ts-ignore
  private _bot: WASocket = {};
  public DisconnectReason = DisconnectReason;
  public chats: WAChats = {};
  public ev: Emmiter = new Emmiter();
  public status: ConnectionStatus = "offline";
  public id: string = "";
  public auth: Auth = new MultiFileAuthState("./session");
  public wcb: WaitCallBack = new WaitCallBack();
  public config: ConnectionConfig = DefaultConnectionConfig;
  public commands: Commands = {};

  public async connect(auth?: string | Auth): Promise<void> {
    return await new Promise(async (resolve, reject) => {
      try {
        if (!!!auth) auth = String("./session");

        if (typeof auth == "string") {
          this.auth = new MultiFileAuthState(auth);
        } else this.auth = auth;

        const { state, saveCreds } = await getBaileysAuth(this.auth);

        this._bot = makeWASocket({ auth: state });
        this._bot.ev.on("creds.update", saveCreds);

        this._bot.ev.on("connection.update", async (update: Partial<ConnectionState>) => {
          if (update.connection == "connecting") {
            this.ev.emit("conn", { action: "connecting" });
          }

          if (update.qr) {
            this.ev.emit("qr", update.qr);
          }

          if (update.connection == "open") {
            this.status = "online";

            this.id = replaceID(this._bot?.user?.id || "");

            const chats: WAChats = JSON.parse((await this.auth.get(`chats`)) || "{}");

            if (!!chats) {
              Object.keys(chats).forEach((key) => {
                key = replaceID(key);

                const chat = chats[key];

                if (!!!chat) return;

                this.chats[key] = new WAChat(replaceID(chat.id), chat.type, chat.name, chat.description, chat.profile);

                if (chat?.users) {
                  Object.keys(chat?.users || {}).forEach((userKey) => {
                    if (!!!userKey) return;

                    userKey = replaceID(userKey);

                    const user = chat?.users[userKey];

                    if (!!!user) return;

                    this.chats[key].users[userKey] = new WAUser(replaceID(user.id), user.name, user.description);
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
            // Bot desligado
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

        this._bot.ev.on("contacts.update", (updates: any) => {
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

        this._bot.ev.on("chats.upsert", (updates: any) => {
          for (const update of updates) {
            update.id = replaceID(update.id);

            if (!this.chats[update.id]) this.chatUpsert(update);
            else if (!this.chats[update.id].users[this.id]) {
              this.chats[update.id].users[this.id] = new WAUser(this.id);
            }
          }
        });

        this._bot.ev.on("chats.update", (updates: any) => {
          for (const update of updates) {
            update.id = replaceID(update.id);

            if (!this.chats[update.id] && !update.readOnly) this.chatUpsert(update);
          }
        });

        this._bot.ev.on("chats.delete", (deletions: any) => {
          for (const id of deletions) this.removeChat(new WAChat(id));
        });

        this._bot.ev.on("groups.update", (updates: any) => {
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

        this._bot.ev.on("group-participants.update", async ({ id, participants, action }) => {
          id = replaceID(id);

          if (!this.chats[id]) {
            if (action != "remove") await this.chatUpsert({ id });
            else if (!participants.includes(getID(this.id))) await this.chatUpsert({ id });
          }

          for (let p of participants) {
            p = replaceID(p);

            const user = new WAUser(p);

            if (action == "add") this.chats[id].users[p] = user;
            if (action == "promote") this.chats[id].users[p].isAdmin = true;
            if (action == "demote") {
              this.chats[id].users[p].isAdmin = false;
              this.chats[id].users[p].isLeader = false;
            }

            const chat = new WAChat(id);

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

        this._bot.ev.on("messages.upsert", async (m: { messages: WAMessage[]; type: MessageUpsertType }) => {
          if (m.messages.length <= 0) return;

          const message: WAMessage = m.messages[m.messages.length - 1];

          if (message.key.remoteJid == "status@broadcast") return;
          if (!message.message) return;

          const msg = await new WhatsAppConvertMessage(this, message, m.type).get();

          msg.setBot(this);

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
      this._bot?.end(reason);
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

        const newChat = new WAChat(chat.id, chat.name || chat.verifiedName || chat.notify || chat.subject);

        if (newChat.id.includes("@g")) {
          if (!chat.participants) {
            const metadata = await this.wcb.waitCall(() => this._bot?.groupMetadata(getID(newChat.id)));

            chat.participants = metadata?.participants || [];
            newChat.name = metadata?.subject;

            newChat.description = Buffer.from(metadata?.desc || "", "base64").toString();
          }

          for (const user of chat.participants) {
            const u = new WAUser(replaceID(user.id));

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

  public async addChat(chat: WAChat) {
    await this.setChat(chat);

    if (this.chats[replaceID(chat.id)]) {
      this.ev.emit("chat", { action: "add", chat: this.chats[replaceID(chat.id)] });
    }
  }

  public async removeChat(chat: WAChat) {
    delete this.chats[chat.id];

    this.ev.emit("chat", { action: "remove", chat });
  }

  public async getChat(chat: WAChat): Promise<WAChat | null> {
    try {
      if (!this.chats[replaceID(chat.id)]) {
        if (chat.id.includes("@s") || !chat.id.includes("@")) {
          await this.chatUpsert(new WAChat(chat.id));
        }

        if (chat.id.includes("@g")) {
          const metadata = await this.wcb.waitCall(() => this._bot?.groupMetadata(getID(chat.id)));
          if (metadata) await this.chatUpsert(metadata);
        }
      }
    } catch (err) {
      this.ev.emit("error", getError(err));
    }

    return this.chats[replaceID(chat.id)] || null;
  }

  public async setChat(chat: WAChat) {
    if (chat.id.includes("status")) return;

    chat.id = replaceID(chat.id);

    if (chat.id.includes("@g")) chat.type = "group";
    if (!chat.id.includes("@")) chat.type = "pv";

    this.chats[chat.id] = new WAChat(chat.id, chat.type, chat.name, chat.description);
    this.chats[chat.id].profile = chat.profile;
    this.chats[chat.id].status = chat.status;
  }

  public async getChats(): Promise<WAChats> {
    return this.chats;
  }

  public async setChats(chats: WAChats) {
    this.chats = chats;
  }

  public async getChatAdmins(chat: ChatInterface): Promise<WAUsers> {
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

  public async getChatLeader(chat: WAChat): Promise<WAUser> {
    let user: WAUser = new WAUser("");

    if (!this.chats.hasOwnProperty(chat.id)) return user;

    for (const id in this.chats[chat.id].users) {
      if (this.chats[chat.id].users[id].isLeader) {
        user = this.chats[chat.id].users[id];
      }
    }

    return user;
  }

  public async addUserInChat(chat: WAChat, user: WAUser) {
    if (!chat.id.includes("@g")) return;

    const bot = (await this.getChat(chat))?.users[this.id];

    if (!bot || !bot.isAdmin) return;

    await this.wcb.waitCall(() => this._bot?.groupParticipantsUpdate(getID(chat.id), [getID(user.id)], "add"));
  }

  public async removeUserInChat(chat: WAChat, user: WAUser) {
    if (!chat.id.includes("@g")) return;

    if (!(await chat.IsAdmin(this.id))) return;

    await this.wcb.waitCall(() => this._bot?.groupParticipantsUpdate(getID(chat.id), [getID(user.id)], "remove"));
  }

  public async promoteUserInChat(chat: ChatInterface, user: UserInterface): Promise<void> {
    if (!chat.id.includes("@g")) return;

    if (!(await chat.IsAdmin(this.id))) return;

    await this.wcb.waitCall(() => this._bot?.groupParticipantsUpdate(getID(chat.id), [getID(user.id)], "promote"));
  }

  public async demoteUserInChat(chat: ChatInterface, user: UserInterface): Promise<void> {
    if (!chat.id.includes("@g")) return;

    if (!(await chat.IsAdmin(this.id))) return;

    await this.wcb.waitCall(() => this._bot?.groupParticipantsUpdate(getID(chat.id), [getID(user.id)], "demote"));
  }

  public async changeChatStatus(chat: ChatInterface, status: ChatStatus): Promise<void> {
    return await this.wcb.waitCall(() => this._bot.sendPresenceUpdate(WAStatus[status] || "available", getID(Chat.getChatId(chat))));
  }

  public async createChat(chat: WAChat) {
    return this.wcb.waitCall(() => this._bot.groupCreate(chat.name || "", [getID(this.id)]));
  }

  public async leaveChat(chat: WAChat): Promise<any> {
    if (this.chats.hasOwnProperty(replaceID(chat.id))) {
      if (!chat.id.includes("@g")) return;

      if (!(await chat.IsAdmin(this.id))) return;

      return this.wcb.waitCall(() => this._bot.groupLeave(getID(chat.id)));
    }

    return this.removeChat(chat);
  }

  public async getUser(user: WAUser): Promise<WAUser> {
    if (this.chats.hasOwnProperty(user.id)) {
      const chat = this.chats[user.id];

      return new WAUser(chat.id, chat.name, chat.description);
    }

    return new WAUser(user.id);
  }

  public async setUser(user: WAUser): Promise<void> {
    this.chats[user.id] = new WAChat(user.id, "pv", user.name, user.description, user.profile);
  }

  public async getUsers(): Promise<Users> {
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

  public async addUser(user: WAUser) {
    await this.setUser(user);
  }

  public async removeUser(user: WAUser) {
    delete this.chats[user.id];
  }

  public async blockUser(user: WAUser) {
    if (user.id == this.id) return;

    await this.wcb.waitCall(() => this._bot?.updateBlockStatus(getID(user.id), "block"));
  }

  public async unblockUser(user: WAUser) {
    if (user.id == this.id) return;

    await this.wcb.waitCall(() => this._bot?.updateBlockStatus(getID(user.id), "unblock"));
  }

  //! ******************************** NOME ********************************

  public async getBotName() {
    return (await this.getChat(new WAChat(this.id)))?.name || "";
  }

  public async setBotName(name: string) {
    return this.wcb.waitCall(() => this._bot.updateProfileName(name));
  }

  public async getUserName(user: WAUser) {
    return (await this.getChat(new WAChat(user.id)))?.name || "";
  }

  public async setUserName(user: WAUser, name: string) {
    if (user.id == this.id) {
      return this.setBotName(name);
    }
  }

  public async getChatName(chat: WAChat) {
    return (await this.getChat(chat))?.name || "";
  }

  public async setChatName(chat: WAChat, name: string) {
    if (!chat.id.includes("@g")) return;

    if (!(await chat.IsAdmin(this.id))) return;

    return this.wcb.waitCall(() => this._bot.groupUpdateSubject(getID(chat.id), name));
  }

  //! ******************************* PROFILE *******************************

  public async getBotProfile() {
    const uri = await this.wcb.waitCall(() => this._bot.profilePictureUrl(getID(this.id), "image"));

    return await getImageURL(uri);
  }

  public async setBotProfile(image: Buffer) {
    return this.wcb.waitCall(() => this._bot.updateProfilePicture(getID(this.id), image));
  }

  public async getUserProfile(user: WAUser) {
    const uri = await this.wcb.waitCall(() => this._bot.profilePictureUrl(getID(user.id), "image"));

    return await getImageURL(uri);
  }

  public async setUserProfile(user: WAUser, image: Buffer) {
    if (user.id == this.id) {
      return this.setBotProfile(image);
    }
  }

  public async getChatProfile(chat: Chat) {
    const uri = await this.wcb.waitCall(() => this._bot.profilePictureUrl(getID(chat.id), "image"));

    return await getImageURL(uri);
  }

  public async setChatProfile(chat: WAChat, image: Buffer) {
    if (!chat.id.includes("@g")) return;

    if (!(await chat.IsAdmin(this.id))) return;

    return this.wcb.waitCall(() => this._bot.updateProfilePicture(getID(chat.id), image));
  }

  //! ****************************** DESCRIÇÃO ******************************

  public async getBotDescription() {
    return this.wcb.waitCall(async () => (await this._bot.fetchStatus(String(getID(this.id))))?.status || "");
  }

  public async setBotDescription(description: string) {
    return this.wcb.waitCall(() => this._bot.updateProfileStatus(description));
  }

  public async getUserDescription(user: WAUser) {
    return this.wcb.waitCall(async () => (await this._bot.fetchStatus(String(getID(user.id))))?.status || "");
  }

  public async setUserDescription(user: WAUser, description: string): Promise<any> {
    if (user.id == this.id) {
      return this.setBotDescription(description);
    }
  }

  public async getChatDescription(chat: WAChat) {
    return (await this.getChat(chat))?.description || "";
  }

  public async setChatDescription(chat: WAChat, description: string): Promise<any> {
    if (!chat.id.includes("@g")) return;

    if (!(await chat.IsAdmin(this.id))) return;

    return this.wcb.waitCall(() => this._bot.groupUpdateDescription(getID(chat.id), description));
  }

  //! ******************************* MESSAGE *******************************

  public async readMessage(message: MessageInterface): Promise<void> {
    const key: proto.IMessageKey = { remoteJid: getID(message.chat.id), id: message.id || "", fromMe: message.user.id == this.id };

    if (message.chat.id.includes("@g")) {
      key.participant = getID(message.user.id);
    }

    return await this.wcb.waitCall(() => this._bot.readMessages([key]));
  }

  public async removeMessage(message: Message) {
    return await this.wcb.waitCall(() =>
      this._bot?.chatModify(
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
      if (message.user.id != this.id && !(await message.chat.IsAdmin(this.id))) return;

      key.participant = getID(message.user.id);
    }

    await this.wcb.waitCall(() => this._bot?.sendMessage(getID(message.chat.id), { delete: key }));
  }

  public async send(content: Message): Promise<Message> {
    //TODO: Colocar auto escrevendo

    const waMSG = new WhatsAppMessage(this, content);
    await waMSG.refactory(content);

    const { chat, message, context } = waMSG;

    var sendedMessage: proto.WebMessageInfo | undefined;

    if (message.hasOwnProperty("templateButtons")) {
      const fullMsg = await this.wcb.waitCall(() =>
        generateWAMessage(chat, message, {
          userJid: getID(this.id),
          ...context,
        })
      );

      fullMsg.message = { viewOnceMessage: { message: fullMsg.message } };

      await this.wcb.waitCall(() => this._bot?.relayMessage(chat, fullMsg.message!, { messageId: fullMsg.key.id! }));

      sendedMessage = fullMsg;
    } else {
      sendedMessage = await this.wcb.waitCall(() => this._bot?.sendMessage(chat, message, context));
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
    const user = await this.wcb.waitCall(() => this._bot?.onWhatsApp(getID(id)));

    if (user && user.length > 0) return { exists: user[0].exists, id: replaceID(user[0].jid) };

    return { exists: false, id: replaceID(id) };
  }

  /**
   * * Atualiza uma mensagem de mídia
   * @param message
   * @returns
   */
  public updateMediaMessage(message: proto.IWebMessageInfo): Promise<proto.IWebMessageInfo> {
    return this._bot.updateMediaMessage(message);
  }

  /**
   * * Aceita o convite para um grupo
   * @param code
   * @returns
   */
  public groupAcceptInvite(code: string): Promise<string | undefined> | undefined {
    return this._bot?.groupAcceptInvite(code);
  }
}
