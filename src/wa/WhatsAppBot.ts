import { Boom } from "@hapi/boom";
import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
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
import { MediaMessage } from "@messages/MediaMessage";
import { BuildConfig } from "@config/BuildConfig";
import { WhatsAppMessage } from "@wa/WAMessage";
import { StatusOptions } from "../types/Status";
import { loggerConfig } from "@config/logger";
import getImageURL from "@utils/getImageURL";
import { Message } from "@messages/Message";
import { Status } from "@models/Status";
import { Chat } from "@models/Chat";
import { User } from "@models/User";
import { Bot } from "@models/Bot";

export class WhatsAppBot extends Bot {
  private _auth: string = "";
  private _bot: WASocket | any;

  public statusOpts: keyof StatusOptions | any = {
    typing: "composing",
    reading: "reading",
    recording: "recording",
    online: "available",
    offline: "unavailable",
  };

  public DisconnectReason = DisconnectReason;
  public chats: { [key: string]: Chat } = {};

  constructor(config: BuildConfig = {}) {
    super();

    this.config = {
      printQRInTerminal: true,
      logger: loggerConfig({ level: "silent" }),
      qrTimeout: 60000,
      browser: ["Rompot", "Chrome", "1.0.0"],
      ...config,
    };
  }

  /**
   * * Conecta ao servidor do WhatsApp
   * @param auth
   * @param config
   * @returns
   */
  public async connect(auth: string, config: BuildConfig = {}): Promise<any> {
    return await new Promise(async (resolve, reject) => {
      try {
        this._auth = auth;
        this.config = { ...this.config, ...config };

        const { state, saveCreds } = await useMultiFileAuthState(this._auth);

        this._bot = makeWASocket({ ...this.config, auth: state });
        this._bot.ev.on("creds.update", saveCreds);

        // Verificando se bot conectou
        this._bot.ev.on("connection.update", async (update: Partial<ConnectionState>) => {
          if (update.qr) {
            this.events.connection.next({
              action: "new",
              status: this.status.getStatus(),
              login: update.qr,
            });
          }

          if (update.connection == "open") {
            this.status.setStatus("online");

            this.setId(this._bot?.user?.id?.replace(/:(.*)@/, "@") || "");

            this.events.connection.next({
              action: update.connection,
              status: this.status.getStatus(),
            });

            resolve(true);
          }

          if (update.connection == "close") {
            this.status.setStatus("offline");

            this.events.connection.next({
              action: update.connection,
              status: this.status.getStatus(),
            });

            // Bot desligado
            const status =
              (update.lastDisconnect?.error as Boom)?.output?.statusCode || update.lastDisconnect?.error || 500;

            if (status === DisconnectReason.loggedOut) return;

            setTimeout(async () => resolve(await this.reconnect(this.config, false)), 2000);
          }
        });

        this._bot.ev.on("contacts.update", (updates: any) => {
          for (const update of updates) this.chatUpsert(update);
        });

        this._bot.ev.on("chats.upsert", (newChats: any) => {
          for (const chat of newChats) this.chatUpsert(chat);
        });

        this._bot.ev.on("chats.update", (updates: any) => {
          for (const update of updates) {
            if (update.id?.includes("@g") && !this.chats[update.id]) this.chatUpsert(update);
          }
        });

        this._bot.ev.on("chats.delete", (deletions: any) => {
          for (const id of deletions) this.removeChat(id);
        });

        this._bot.ev.on("groups.update", (updates: any) => {
          for (const update of updates) this.chatUpsert(update);
        });

        this._bot.ev.on("group-participants.update", async ({ id, participants, action }: any) => {
          if (!this.chats[id]) await this.chatUpsert({ id });

          for (const u of participants) {
            const member = new User(u);

            if (action == "add") await this.chats[id].addMember(member, false);
            if (action == "promote") this.chats[id].members[u].setAdmin(true);
            if (action == "demote") {
              this.chats[id].members[u].setAdmin(false);
              this.chats[id].members[u].setLeader(false);
            }

            const user = this.chats[id].getMember(member);

            if (action == "remove") await this.chats[id].removeMember(member, false);

            this.events.member.next({ action, chat: this.chats[id], user });
          }
        });

        this._bot.ev.on("messages.upsert", async (m: { messages: WAMessage[]; type: MessageUpsertType }) => {
          if (m.messages.length <= 0) return;

          const message: WAMessage = m.messages[m.messages.length - 1];

          if (message.key.remoteJid == "status@broadcast") return;

          const msg = await new WhatsAppConvertMessage(this, message, m.type).get();

          msg.setBot(this);

          if (message.key.fromMe && !this.config.receiveAllMessages) {
            return this.events["bot-message"].next(msg);
          }

          this.events.message.next(msg);
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
    if (alert) this.events.connection.next({ action: "reconnecting" });

    if (this.status.getStatus() == "online") {
      this.stop(DisconnectReason.loggedOut);
    }

    this.status.setStatus("offline");

    return this.connect(this._auth, config || this.config);
  }

  /**
   * * Desliga a conexão com o servidor do WhatsApp
   * @param reason
   * @returns
   */
  public async stop(reason?: any): Promise<any> {
    this._bot?.end(reason);
  }

  /**
   * * Lê o chat e seta ele
   * @param chat
   */
  private async chatUpsert(chat: any) {
    try {
      if (chat.id || chat.newJId) {
        const newChat = new Chat(chat.id || chat.newJid, chat.name || chat.verifiedName || chat.notify || chat.subject);

        if (newChat.id.includes("@g")) {
          if (!chat.participants) {
            const metadata = await this.add(() => this._bot?.groupMetadata(newChat.id));

            chat.participants = metadata?.participants || [];
            newChat.name = metadata?.subject;
            newChat.description = Buffer.from(metadata?.desc, "base64").toString();
          }

          for (const user of chat.participants) {
            const u = new User(user.id);

            u.setAdmin(!!user.admin || user.isAdmin || user.isSuperAdmin || false);
            u.setLeader(user.isSuperAdmin || false);

            newChat.addMember(u, false);
          }
        }

        this.setChat(newChat);
      }
    } catch (e) {
      this.events.error.next(e);
    }
  }

  /**
   * * Obter uma sala de bate-papo
   * @param id
   * @returns
   */
  public async getChat(id: string): Promise<Chat | null> {
    if (!this.chats[id]) {
      if (id.includes("@s")) {
        const [user] = (await this.add(() => this._bot?.onWhatsApp(id))) || [];
        if (user && user.exists) await this.chatUpsert(new Chat(user.jid));
      }

      if (id.includes("@g")) {
        const metadata = await this.add(() => this._bot?.groupMetadata(id));
        if (metadata) await this.chatUpsert(metadata);
      }
    }

    return this.chats[id];
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
    if (chat.id == "status@broadcast" || this.chats[chat.id]) return;
    if (chat.id.includes("@g")) chat.setType("group");
    if (chat.id.includes("@s")) chat.setType("pv");

    this.chats[chat.id] = chat;
    this.events.chat.next(chat);
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
    delete this.chats[typeof id == "string" ? id : id.id];
  }

  /**
   * * Adiciona um usuário a uma sala de bate-papo
   * @param chat
   * @param user
   */
  public async addMember(chat: Chat, user: User) {
    if (!chat.id.includes("@g.us")) return;

    const bot = (await this.getChat(chat.id))?.getMember(new User(this.id || ""));

    if (!bot || !bot.getAdmin()) return;

    await this.add(() => this._bot?.groupParticipantsUpdate(chat.id, [user.id], "add"));
  }

  /**
   * * Remove um usuário da sala de bate-papo
   * @param chat
   * @param user
   */
  public async removeMember(chat: Chat, user: User) {
    if (!chat.id.includes("@g.us")) return;

    const bot = (await this.getChat(chat.id))?.getMember(new User(this.id || ""));

    if (!bot || !bot.getAdmin()) return;

    await this.add(() => this._bot?.groupParticipantsUpdate(chat.id, [user.id], "remove"));
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
        message.chat.id
      )
    );
  }

  /**
   * * Deleta uma mensagem da sala de bate-papo
   * @param message
   * @returns
   */
  public async deleteMessage(message: Message): Promise<any> {
    const key: any = { remoteJid: message.chat.id, id: message.id };

    if (message.chat.id.includes("@g")) key.participant = message.user.id;

    return await this.add(() => this._bot?.sendMessage(message.chat.id, { delete: key }));
  }

  /**
   * * Bloqueia um usuário
   * @param user
   */
  public async blockUser(user: User): Promise<any> {
    await this.add(() => this._bot?.updateBlockStatus(user.id, "block"));
  }

  /**
   * * Desbloqueia um usuário
   * @param user
   */
  public async unblockUser(user: User): Promise<any> {
    await this.add(() => this._bot?.updateBlockStatus(user.id, "unblock"));
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
  public async getProfile(id: string | Chat | User = this.id): Promise<any> {
    let url: any;

    if (typeof id == "string") url = await this.add(() => this._bot.profilePictureUrl(id, "image"));
    if (id instanceof Chat || id instanceof User)
      url = await this.add(() => this._bot.profilePictureUrl(id.id, "image"));

    if (!!url) return await getImageURL(url);

    return undefined;
  }

  /**
   * * Define a imagem do bot ou de um grupo
   * @param image
   * @param id
   * @returns
   */
  public async setProfile(image: Buffer, id: Chat | string = this.id): Promise<any> {
    if (typeof id == "string") return this.add(() => this._bot.updateProfilePicture(id, image));
    if (id instanceof Chat) return this.add(() => this._bot.updateProfilePicture(id.id, { url: image }));
  }

  /**
   * * Cria uma nova sala de bate-papo
   * @param name
   * @returns
   */
  public async createChat(name: string): Promise<any> {
    return this.add(() => this._bot.groupCreate(name, [this.id]));
  }

  /**
   * * Define o nome da sala de bate-papo
   * @param id
   * @param name
   * @returns
   */
  public async setChatName(id: string | Chat, name: string): Promise<any> {
    if (typeof id == "string") return this.add(() => this._bot.groupUpdateSubject(id, name));
    if (id instanceof Chat) return this.add(() => this._bot.groupUpdateSubject(id.id, name));
  }

  /**
   * * Retorna a descrição do bot ou de um usuário
   * @param id
   * @returns
   */
  public async getDescription(id: User | string = this.id): Promise<any> {
    if (typeof id != "string" && id.id) id = id.id;

    if (typeof id == "string" && id?.includes("@s")) {
      return this.add(async () => (await this._bot.fetchStatus(id))?.status);
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

    if (typeof id == "string" && id?.includes("@g")) {
      this.chats[id]?.setDescription(desc);
      return this.add(() => this._bot.groupUpdateDescription(id, desc));
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
    if (typeof chat == "string") return this.add(() => this._bot.groupLeave(chat));
    if (chat.id) return this.add(() => this._bot.groupLeave(chat.id));

    if (this.chats[chat.id]) this.removeChat(chat.id);
  }

  public async sendMessage(content: Message): Promise<Message> {
    const waMSG = new WhatsAppMessage(this, content);
    await waMSG.refactory(content);

    const { chat, message, context } = waMSG;

    if (message.hasOwnProperty("templateButtons")) {
      const fullMsg = await this.add(() =>
        generateWAMessage(chat, message, {
          userJid: this._bot?.user?.id,
          logger: this.config.logger,
          ...context,
        })
      );

      fullMsg.message = { viewOnceMessage: { message: fullMsg.message } };

      if (content instanceof MediaMessage) {
        await this._bot?.relayMessage(chat, fullMsg.message!, { messageId: fullMsg.key.id! });
      } else await this.add(() => this._bot?.relayMessage(chat, fullMsg.message!, { messageId: fullMsg.key.id! }));

      return await new WhatsAppConvertMessage(this, fullMsg).get();
    }

    if (content instanceof MediaMessage) {
      return await new WhatsAppConvertMessage(this, await this._bot?.sendMessage(chat, message, context)).get();
    }

    const sendedMessage = await this.add(() => this._bot?.sendMessage(chat, message, context));

    return sendedMessage ? await new WhatsAppConvertMessage(this, sendedMessage).get() : content;
  }

  /**
   * * Envia um conteúdo
   * @param content
   * @returns
   */
  public async sendStatus(content: Status): Promise<any> {
    if (content.status === "reading") {
      const key: any = { remoteJid: content.chat?.id, id: content.message?.id };

      if (key.remoteJid?.includes("@g")) key.participant = content.message?.user.id;

      return await this.add(() => this._bot?.readMessages([key]));
    }

    const status: WAPresence = this.statusOpts[content.status];
    return await this.add(() => this._bot?.sendPresenceUpdate(status, content.chat?.id));
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
    const user = await this.add(() => this._bot?.onWhatsApp(id));

    if (user && user.length > 0) return { exists: user[0].exists, id: user[0].jid };

    return { exists: false, id };
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
