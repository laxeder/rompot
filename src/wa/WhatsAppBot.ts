import { Boom } from "@hapi/boom";
import makeWASocket, {
  DisconnectReason,
  downloadMediaMessage,
  proto,
  MediaDownloadOptions,
  UserFacingSocketConfig,
  ConnectionState,
  WAMessage,
  MessageUpsertType,
  WASocket,
  WAPresence,
  generateWAMessage,
} from "@adiwajshing/baileys";

import { WhatsAppConvertMessage } from "@wa/WAConvertMessage";
import { getBaileysAuth, MultiFileAuthState } from "@wa/Auth";
import { ConnectionConfig } from "@config/ConnectionConfig";
import { ReactionMessage } from "@messages/ReactionMessage";
import { MediaMessage } from "@messages/MediaMessage";
import { WhatsAppMessage } from "@wa/WAMessage";
import { StatusType } from "../types/Status";
import getImageURL from "@utils/getImageURL";
import Message from "@messages/Message";
import { getID, replaceID } from "@wa/ID";
import { Status } from "@modules/Status";
import { Chat } from "@modules/Chat";
import { User } from "@modules/User";
import { Bot } from "@modules/Bot";
import pino from "pino";

export class WhatsAppBot extends Bot {
  //@ts-ignore
  private _bot: WASocket;

  public statusOpts: keyof StatusType | any = {
    typing: "composing",
    reading: "reading",
    recording: "recording",
    online: "available",
    offline: "unavailable",
  };

  public DisconnectReason = DisconnectReason;
  public chats: { [key: string]: Chat } = {};

  constructor(config: ConnectionConfig) {
    super();

    this.config = {
      printQRInTerminal: true,
      logger: pino({ level: "fatal" }),
      ...config,
    };
  }

  /**
   * * Conecta ao servidor do WhatsApp
   * @param auth
   * @param config
   * @returns
   */
  public async connect(config: ConnectionConfig = this.config): Promise<any> {
    return await new Promise(async (resolve, reject) => {
      try {
        this.config = { ...this.config, ...config };

        if (!!!this.config.auth) this.config.auth = String(Date.now());

        if (typeof this.config.auth == "string") this.config.auth = new MultiFileAuthState(this.config.auth);

        const { state, saveCreds } = await getBaileysAuth(this.config.auth);

        this._bot = makeWASocket({ ...this.config, auth: state });
        this._bot.ev.on("creds.update", saveCreds);

        // Verificando se bot conectou
        this._bot.ev.on("connection.update", async (update: Partial<ConnectionState>) => {
          if (update.connection == "connecting") {
            this.emit("conn", { action: "connecting", status: "offline" });
          }

          if (update.qr) {
            this.emit("qr", update.qr);
          }

          if (update.connection == "open") {
            this.status.status = "online";

            this.id = replaceID(this._bot?.user?.id || "");

            const chats = JSON.parse((await this.config.auth.get(`chats`)) || "{}");

            if (!!chats) {
              Object.keys(chats).forEach((key) => {
                key = replaceID(key);

                const chat = chats[key];

                if (!!!chat) return;

                this.chats[key] = new Chat(replaceID(chat.id), chat.name);
                this.chats[key].description = chat.description;
                this.chats[key].setBot(this);

                if (chat?.members) {
                  Object.keys(chat?.members || {}).forEach((mKey) => {
                    if (!!!mKey) return;

                    mKey = replaceID(mKey);

                    const member = chat?.members[mKey];

                    if (!!!member) return;

                    this.chats[key].members[mKey] = new User(replaceID(member.id), member.name, member.isAdmin, member.isLeader);
                  });
                }
              });

              this.saveChats();
            }

            this.emit("open", { status: "online", isNewLogin: update.isNewLogin || false });

            resolve(true);
          }

          if (update.connection == "close") {
            // Bot desligado
            const status = (update.lastDisconnect?.error as Boom)?.output?.statusCode || update.lastDisconnect?.error || 500;

            if (this.status.status == "online") {
              this.status.status = "offline";

              this.emit("close", { status: "offline" });
            }

            if (status == DisconnectReason.badSession || status === DisconnectReason.loggedOut) {
              return this.emit("closed", { status: "offline" });
            }

            setTimeout(async () => resolve(await this.reconnect(this.config, status != DisconnectReason.restartRequired || this.status.status == "offline")), 2000);
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
            else if (!this.chats[update.id].members[this.id]) {
              this.chats[update.id].members[this.id] = new User(this.id);
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
          for (const id of deletions) this.removeChat(replaceID(id));
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

        this._bot.ev.on("group-participants.update", async ({ id, participants, action }: any) => {
          id = replaceID(id);

          if (!this.chats[id]) {
            if (action != "remove") await this.chatUpsert({ id });
            else if (!participants.includes(getID(this.id))) await this.chatUpsert({ id });
          }

          for (let u of participants) {
            u = replaceID(u);

            const member = new User(u);

            if (action == "add") this.chats[id].members[u] = member;
            if (action == "promote") this.chats[id].members[u].isAdmin = true;
            if (action == "demote") {
              this.chats[id].members[u].isAdmin = false;
              this.chats[id].members[u].isLeader = false;
            }

            const user = new User(member.id);
            const chat = new Chat(id);

            if (this.chats[id]) {
              chat.name = this.chats[id].name;
              chat.description = this.chats[id].description;
              chat.members = this.chats[id].members;
              chat.type = this.chats[id].type;

              const m = this.chats[id]?.getMember(member);

              user.id = m?.id || "";
              user.name = m?.name || "";
              user.isAdmin = m?.isAdmin || false;
              user.isAdmin = m?.isAdmin || false;
            }

            if (action == "remove") {
              if (u == this.id) {
                delete this.chats[id];

                this.emit("chat", { action: "remove", chat });
              } else {
                delete this.chats[id]?.members[member.id];
              }
            }

            this.saveChats();

            this.emit("member", { action, member: user, chat });
          }
        });

        this._bot.ev.on("messages.upsert", async (m: { messages: WAMessage[]; type: MessageUpsertType }) => {
          if (m.messages.length <= 0) return;

          const message: WAMessage = m.messages[m.messages.length - 1];

          if (message.key.remoteJid == "status@broadcast") return;
          if (!message.message) return;

          const msg = await new WhatsAppConvertMessage(this, message, m.type).get();

          msg.setBot(this);

          if (this.sendAwaitMessages(msg)) return;

          if (message.key.fromMe && !this.config.receiveAllMessages) {
            return this.emit("me", msg);
          }

          this.emit("message", msg);
        });
      } catch (err: any) {
        reject(err?.stack || err);
      }
    });
  }

  /**
   * * Reconecta ao servidor do WhatsApp
   * @param config
   * @returns
   */
  public async reconnect(config?: UserFacingSocketConfig, alert: boolean = true): Promise<any> {
    if (alert) this.emit("reconnecting", { status: "offline" });

    if (this.status.status == "online") {
      this.stop(DisconnectReason.loggedOut);
    }

    this.status.status = "offline";

    return this.connect(config || this.config);
  }

  /**
   * * Desliga a conexão com o servidor do WhatsApp
   * @param reason
   * @returns
   */
  public async stop(reason: any = DisconnectReason.loggedOut): Promise<any> {
    this._bot?.end(reason);
  }

  /**
   * * Salva os chats salvos
   * @param chats
   */
  protected async saveChats(chats: any = this.chats) {
    await this.config.auth.set(`chats`, JSON.stringify(chats));
  }

  /**
   * * Lê o chat e seta ele
   * @param chat
   */
  protected async chatUpsert(chat: any) {
    try {
      if (chat.id || chat.newJId) {
        chat.id = replaceID(chat.id || chat.newJID);

        const newChat = new Chat(chat.id, chat.name || chat.verifiedName || chat.notify || chat.subject);

        if (newChat.id.includes("@g")) {
          if (!chat.participants) {
            const metadata = await this.add(() => this._bot?.groupMetadata(getID(newChat.id)));

            chat.participants = metadata?.participants || [];
            newChat.name = metadata?.subject;

            newChat.description = Buffer.from(metadata?.desc || "", "base64").toString();
          }

          for (const user of chat.participants) {
            const u = new User(replaceID(user.id));

            u.isAdmin = !!user.admin || user.isAdmin || user.isSuperAdmin || false;
            u.isLeader = user.admin == "superadmin" || user.isSuperAdmin || false;

            newChat.members[u.id] = u;
          }
        }

        this.setChat(newChat);
      }
    } catch (e: any) {
      this.emit("error", e);
    }
  }

  /**
   * * Obter uma sala de bate-papo
   * @param id
   * @returns
   */
  public async getChat(id: string): Promise<Chat | null> {
    try {
      id = replaceID(id);

      if (!this.chats[id]) {
        if (id.includes("@s") || !id.includes("@")) {
          await this.chatUpsert(new Chat(id));
        }

        if (id.includes("@g")) {
          const metadata = await this.add(() => this._bot?.groupMetadata(getID(id)));
          if (metadata) await this.chatUpsert(metadata);
        }
      }
    } catch (e: any) {
      this.emit("error", e);
    }

    return this.chats[id] || {};
  }

  /**
   * * Obter todas as salas de bate-papo
   * @returns
   */
  public async getChats(): Promise<{ [key: string]: Chat }> {
    return this.chats;
  }

  /**
   * * Define uma sala de bate-papo
   * @param chat
   */
  public async setChat(chat: Chat) {
    chat.id = replaceID(chat.id);

    if (chat.id == "status@broadcast") return;
    if (chat.id.includes("@g")) chat.type = "group";
    if (!chat.id.includes("@")) chat.type = "pv";

    chat.setBot(this);

    this.chats[chat.id] = chat;

    this.saveChats();

    this.emit("chat", { action: "add", chat });
  }

  /**
   * * Define as salas de bate-papo
   * @param chats
   */
  public async setChats(chats: { [key: string]: Chat }) {
    this.chats = chats;
  }

  /**
   * * Remove uma sala de bate-papo
   * @param id
   */
  public async removeChat(id: Chat | string) {
    const chat = new Chat(typeof id == "string" ? id : id.id);

    delete this.chats[typeof id == "string" ? id : id.id];

    this.emit("chat", { action: "remove", chat });
  }

  /**
   * * Adiciona um usuário a uma sala de bate-papo
   * @param chat
   * @param user
   */
  public async addMember(chat: Chat, user: User) {
    if (!chat.id.includes("@g")) return;

    const bot = (await this.getChat(chat.id))?.getMember(new User(this.id || ""));

    if (!bot || !bot.isAdmin) return;

    await this.add(() => this._bot?.groupParticipantsUpdate(getID(chat.id), [getID(user.id)], "add"));
  }

  /**
   * * Remove um usuário da sala de bate-papo
   * @param chat
   * @param user
   */
  public async removeMember(chat: Chat, user: User) {
    if (!chat.id.includes("@g.us")) return;

    const bot = (await this.getChat(chat.id))?.getMember(new User(this.id || ""));

    if (!bot || !bot.isAdmin) return;

    await this.add(() => this._bot?.groupParticipantsUpdate(getID(chat.id), [getID(user.id)], "remove"));
  }

  /**
   * * Remove uma mensagem da sala de bate-papo
   * @param message
   * @returns
   */
  public async removeMessage(message: Message) {
    return await this.add(() =>
      this._bot?.chatModify(
        {
          clear: { messages: [{ id: message.id || "", fromMe: message.fromMe, timestamp: Number(message.timestamp) }] },
        },
        getID(message.chat.id)
      )
    );
  }

  /**
   * * Deleta uma mensagem da sala de bate-papo
   * @param message
   * @returns
   */
  public async deleteMessage(message: Message): Promise<any> {
    const key: any = { remoteJid: getID(message.chat.id), id: message.id };

    if (message.chat.id.includes("@g")) key.participant = getID(message.user.id);

    return await this.add(() => this._bot?.sendMessage(getID(message.chat.id), { delete: key }));
  }

  /**
   * * Bloqueia um usuário
   * @param user
   */
  public async blockUser(user: User): Promise<any> {
    await this.add(() => this._bot?.updateBlockStatus(getID(user.id), "block"));
  }

  /**
   * * Desbloqueia um usuário
   * @param user
   */
  public async unblockUser(user: User): Promise<any> {
    await this.add(() => this._bot?.updateBlockStatus(getID(user.id), "unblock"));
  }

  /**
   * * Define o nome do bot
   * @param name
   * @returns
   */
  public async setBotName(name: string): Promise<any> {
    return this.add(() => this._bot.updateProfileName(name));
  }

  /**
   * * Retorna a imagem do bot / usuário / chat
   * @param id
   * @returns
   */
  public async getProfile(id: string | Chat | User = getID(this.id)): Promise<any> {
    let url: any;

    if (typeof id == "string") url = await this.add(() => this._bot.profilePictureUrl(getID(id), "image"));
    if (id instanceof Chat || id instanceof User) url = await this.add(() => this._bot.profilePictureUrl(getID(id.id), "image"));

    if (!!url) return await getImageURL(url);

    return undefined;
  }

  /**
   * * Define a imagem do bot ou de um grupo
   * @param image
   * @param id
   * @returns
   */
  public async setProfile(image: Buffer, id: Chat | string = getID(this.id)): Promise<any> {
    if (typeof id == "string") return this.add(() => this._bot.updateProfilePicture(getID(id), image));

    //@ts-ignore
    if (id instanceof Chat) return this.add(() => this._bot.updateProfilePicture(getID(id.id), { url: image }));
  }

  /**
   * * Cria uma nova sala de bate-papo
   * @param name
   * @returns
   */
  public async createChat(name: string): Promise<any> {
    return this.add(() => this._bot.groupCreate(name, [getID(this.id)]));
  }

  /**
   * * Define o nome da sala de bate-papo
   * @param id
   * @param name
   * @returns
   */
  public async setChatName(id: string | Chat, name: string): Promise<any> {
    if (typeof id == "string") return this.add(() => this._bot.groupUpdateSubject(getID(id), name));
    if (id instanceof Chat) return this.add(() => this._bot.groupUpdateSubject(getID(id.id), name));
  }

  /**
   * * Retorna a descrição do bot ou de um usuário
   * @param id
   * @returns
   */
  public async getDescription(id: User | string = this.id): Promise<any> {
    if (typeof id != "string" && id.id) id = id.id;

    id = getID(`${id}`);

    if (typeof id == "string" && id?.includes("@s")) {
      return this.add(async () => (await this._bot.fetchStatus(String(id)))?.status);
    }

    return "";
  }

  /**
   * * Define a descrição do bot ou de uma sala de bate-papo
   * @param desc
   * @param id
   * @returns
   */
  public async setDescription(desc: string, id?: string | Chat): Promise<any> {
    if (typeof id != "string" && id?.id) id = id.id;

    id = getID(`${id}`);

    if (typeof id == "string" && id?.includes("@g")) {
      this.chats[replaceID(id)]?.setDescription(desc);
      return this.add(() => this._bot.groupUpdateDescription(String(id), desc));
    }

    if (!!!id) {
      return this.add(() => this._bot.updateProfileStatus(desc));
    }
  }

  /**
   * * Sai da sala de bate-papo
   * @param chat
   * @returns
   */
  public async leaveChat(chat: Chat | string): Promise<any> {
    if (typeof chat == "string") return this.add(() => this._bot.groupLeave(getID(chat)));
    if (chat.id) return this.add(() => this._bot.groupLeave(getID(chat.id)));

    if (this.chats[replaceID(chat.id)]) this.removeChat(chat.id);
  }

  public async sendMessage(content: Message): Promise<Message> {
    if (!this.config.disableAutoTyping && !(content instanceof ReactionMessage)) {
      await this.sendStatus(new Status("typing", content.chat, content));
    }

    const waMSG = new WhatsAppMessage(this, content);
    await waMSG.refactory(content);

    const { chat, message, context } = waMSG;

    var sendedMessage: proto.WebMessageInfo | undefined;

    if (message.hasOwnProperty("templateButtons")) {
      const fullMsg = await this.add(() =>
        generateWAMessage(chat, message, {
          userJid: getID(this.id),
          logger: this.config.logger,
          ...context,
        })
      );

      fullMsg.message = { viewOnceMessage: { message: fullMsg.message } };

      if (content instanceof MediaMessage) {
        await this.add(() => this._bot?.relayMessage(chat, fullMsg.message!, { messageId: fullMsg.key.id! }));
      } else await this.add(() => this._bot?.relayMessage(chat, fullMsg.message!, { messageId: fullMsg.key.id! }));

      sendedMessage = fullMsg;
    } else {
      sendedMessage = await this.add(() => this._bot?.sendMessage(chat, message, context));
    }

    return sendedMessage ? await new WhatsAppConvertMessage(this, sendedMessage).get() : content;
  }

  /**
   * * Envia um conteúdo
   * @param content
   * @returns
   */
  public async sendStatus(content: Status): Promise<any> {
    if (content.status === "reading") {
      const key: any = { remoteJid: getID(content.chat?.id || ""), id: content.message?.id };

      if (key.remoteJid?.includes("@g")) key.participant = getID(content.message?.user.id || "");

      return await this.add(() => this._bot?.readMessages([key]));
    }

    const status: WAPresence = this.statusOpts[content.status];
    return await this.add(() => this._bot?.sendPresenceUpdate(status, getID(content.chat?.id || "")));
  }

  /**
   * * Faz o download de arquivos do WhatsApp
   * @param message
   * @param type
   * @param options
   * @param ctx
   * @returns
   */
  public download(message: any, type: "buffer" | "stream", options: MediaDownloadOptions, ctx?: any): Promise<any> {
    return downloadMediaMessage(message, type, options, ctx);
  }

  /**
   * * Verifica se o número está registrado no WhatsApp
   * @returns
   */
  public async onExists(id: string): Promise<{ exists: boolean; id: string }> {
    const user = await this.add(() => this._bot?.onWhatsApp(getID(id)));

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
